param([string[]]$Only = @())
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$outputDirectory = Join-Path $projectRoot 'public/gallery'
New-Item -ItemType Directory -Force $outputDirectory | Out-Null
$sources = @(
  @{id='carina'; url='https://science.nasa.gov/asset/webb/cosmic-cliffs-in-the-carina-nebula-nircam-image/'},
  @{id='whirlpool'; url='https://science.nasa.gov/asset/hubble/out-of-this-whirl-the-whirlpool-galaxy-m51-and-companion-galaxy/'},
  @{id='sombrero'; url='https://science.nasa.gov/image-detail/sombrero-galaxy-hubble/'},
  @{id='sirius'; url='https://science.nasa.gov/asset/hubble/the-dog-star-sirius-and-its-tiny-companion/'},
  @{id='helix'; url='https://science.nasa.gov/image-detail/helixnebula-by-wise-large/'},
  @{id='pillars'; url='https://science.nasa.gov/asset/webb/pillars-of-creation-nircam-image/'},
  @{id='blackhole'; url='https://www.nasa.gov/universe/nasa-visualization-shows-a-black-holes-warped-world/'},
  @{id='m87'; url='https://www.eso.org/public/images/eso1907a/'},
  @{id='titan'; url='https://science.nasa.gov/resource/titan-global-map-june-2015/'},
  @{id='enceladus'; url='https://science.nasa.gov/resource/color-map-of-enceladus-2014/'},
  @{id='io'; url='https://science.nasa.gov/3d-resources/jupiter-io-b/'},
  @{id='europa'; url='https://science.nasa.gov/3d-resources/jupiter-europa/'},
  @{id='ganymede'; url='https://science.nasa.gov/3d-resources/jupiter-ganymede/'},
  @{id='callisto'; url='https://science.nasa.gov/3d-resources/jupiter-callisto/'}
)
$manifest = if (Test-Path (Join-Path $outputDirectory 'sources.json')) { @(Get-Content (Join-Path $outputDirectory 'sources.json') -Raw | ConvertFrom-Json) } else { @() }
foreach ($source in $sources) {
  if ($Only.Count -gt 0 -and $source.id -notin $Only) { continue }
  try {
    $page = (Invoke-WebRequest -Uri $source.url -TimeoutSec 30).Content
    $match = [regex]::Match($page, '<meta[^>]*property=["'']og:image["''][^>]*content=["'']([^"'']+)', 'IgnoreCase')
    if (!$match.Success) { $match = [regex]::Match($page, '<meta[^>]*content=["'']([^"'']+)["''][^>]*property=["'']og:image', 'IgnoreCase') }
    if (!$match.Success) { throw 'No image metadata' }
    $imageUrl = [System.Net.WebUtility]::HtmlDecode($match.Groups[1].Value)
    if ($source.url -like '*/3d-resources/*') {
      $original = [regex]::Matches($page, 'href=["'']([^"'']+)["'']', 'IgnoreCase') | ForEach-Object { [System.Net.WebUtility]::HtmlDecode($_.Groups[1].Value) } | Where-Object { $_ -match '\.jpg$' } | Select-Object -First 1
      if ($original) { $imageUrl = $original }
    }
    $imageResponse = Invoke-WebRequest -Uri $imageUrl -TimeoutSec 45
    $contentType = $imageResponse.Headers['Content-Type'] -join ''
    if ($contentType -notlike 'image/*') { throw "Unexpected content type: $contentType" }
    $extension = if ($contentType -like '*png*') { 'png' } elseif ($contentType -like '*gif*') { 'gif' } elseif ($contentType -like '*webp*') { 'webp' } else { 'jpg' }
    $file = "$($source.id).$extension"
    [System.IO.File]::WriteAllBytes((Join-Path $outputDirectory $file), $imageResponse.Content)
    $manifest = @($manifest | Where-Object { $_.id -ne $source.id })
    $manifest += @{ id=$source.id; source=$source.url; image=$imageUrl; file=$file }
    Write-Output "$file downloaded"
  } catch { Write-Output "$($source.id): $($_.Exception.Message)" }
}
$manifest | ConvertTo-Json -Depth 4 | Set-Content (Join-Path $outputDirectory 'sources.json') -Encoding utf8
