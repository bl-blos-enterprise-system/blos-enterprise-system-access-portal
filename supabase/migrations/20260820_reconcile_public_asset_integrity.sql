-- Reconciliar la metadata anunciada con los bytes publicos realmente almacenados.
-- No modifica el contenido; corrige longitud y SHA-256 calculados desde content_base64.

with canonical as (
  select
    id,
    octet_length(decode(regexp_replace(content_base64, '\s', '', 'g'), 'base64')) as actual_size,
    encode(
      digest(decode(regexp_replace(content_base64, '\s', '', 'g'), 'base64'), 'sha256'),
      'hex'
    ) as actual_sha256
  from public.document_assets
  where status = 'active'
    and visibility = 'public'
    and metadata ->> 'public_release' = 'true'
    and content_base64 is not null
)
update public.document_assets asset
set
  file_size_bytes = canonical.actual_size,
  checksum_sha256 = canonical.actual_sha256,
  updated_at = now()
from canonical
where asset.id = canonical.id
  and (
    asset.file_size_bytes is distinct from canonical.actual_size
    or lower(coalesce(asset.checksum_sha256, '')) is distinct from canonical.actual_sha256
  );
