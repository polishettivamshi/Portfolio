#Requires -Version 5.1
<#
.SYNOPSIS
    Generates the square favicon assets used by the portfolio site.

.DESCRIPTION
    Google Search only renders a favicon when the file is a square (1:1) image
    that is at least 8x8px (48x48px or larger is recommended). This script
    crops the source image to a square and writes every icon size that
    index.html declares:

        public/favicon.ico            multi-resolution 16x16 / 32x32 / 48x48
        public/favicon-48x48.png
        public/favicon-96x96.png
        public/favicon-192x192.png
        public/favicon-512x512.png
        public/apple-touch-icon.png   180x180

    The files are written into public/ because Vite copies the contents of
    public/ to the root of the deployed site, which is
    https://polishettivamshi.github.io/Portfolio/.

.PARAMETER Source
    Source image. Defaults to public/images/Portfolio_icon.jpeg.

.PARAMETER OutDir
    Folder that receives the generated icons. Defaults to public/.

.PARAMETER Crop
    Optional crop window in ImageMagick "WxH+X+Y" geometry, for example
    "180x180+70+8". The default, "170x170+67+14", frames the head and shoulders
    of public/images/Portfolio_icon.jpeg. Pass an empty string to use the
    largest centred square of the source image instead.

.PARAMETER IcoSizes
    Frame sizes packed into favicon.ico.

.PARAMETER PngSizes
    Sizes written as standalone PNG files.

.PARAMETER AppleTouchSize
    Size of apple-touch-icon.png.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File scripts/generate-favicons.ps1

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File scripts/generate-favicons.ps1 -Crop "332x332+0+2"
#>
[CmdletBinding()]
param(
    [string] $Source,
    [string] $OutDir,
    # Head-and-shoulders framing of the default source image. Pass an empty
    # string ('' or "") to use the largest centred square of the source instead.
    [string] $Crop = '170x170+67+14',
    [int[]]  $IcoSizes = @(16, 32, 48),
    [int[]]  $PngSizes = @(48, 96, 192, 512),
    [int]    $AppleTouchSize = 180
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

# PowerShell does not populate $PSScriptRoot while an advanced script is binding
# its parameters, so the default paths are resolved here instead.
$scriptRoot = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if ([string]::IsNullOrWhiteSpace($Source)) {
    $Source = Join-Path -Path $scriptRoot -ChildPath '..\public\images\Portfolio_icon.jpeg'
}
if ([string]::IsNullOrWhiteSpace($OutDir)) {
    $OutDir = Join-Path -Path $scriptRoot -ChildPath '..\public'
}

function Get-CropRectangle {
    <# Returns the square crop window taken from the source image. #>
    param(
        [System.Drawing.Image] $Image,
        [string] $Crop
    )

    if ([string]::IsNullOrWhiteSpace($Crop)) {
        $side = [Math]::Min($Image.Width, $Image.Height)
        $x    = [int](($Image.Width - $side) / 2)
        $y    = [int](($Image.Height - $side) / 2)
        return New-Object System.Drawing.Rectangle -ArgumentList $x, $y, $side, $side
    }

    if ($Crop -notmatch '^(\d+)x(\d+)\+(\d+)\+(\d+)$') {
        throw "Invalid -Crop value '$Crop'. Expected geometry such as '180x180+70+8'."
    }

    $width  = [int]$Matches[1]
    $height = [int]$Matches[2]
    $x      = [int]$Matches[3]
    $y      = [int]$Matches[4]

    if ($width -ne $height) {
        throw "-Crop must produce a square (1:1) window, got ${width}x${height}."
    }
    if (($x + $width) -gt $Image.Width -or ($y + $height) -gt $Image.Height) {
        throw "-Crop window falls outside the $($Image.Width)x$($Image.Height) source image."
    }

    return New-Object System.Drawing.Rectangle -ArgumentList $x, $y, $width, $height
}

function New-SquareBitmap {
    <# Scales the crop window of the source image into a square bitmap. #>
    param(
        [System.Drawing.Image] $Image,
        [System.Drawing.Rectangle] $CropRectangle,
        [int] $Size
    )

    $bitmap   = New-Object System.Drawing.Bitmap -ArgumentList $Size, $Size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
        $graphics.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $destination = New-Object System.Drawing.Rectangle -ArgumentList 0, 0, $Size, $Size
        $graphics.DrawImage($Image, $destination, $CropRectangle, ([System.Drawing.GraphicsUnit]::Pixel))
    }
    finally {
        $graphics.Dispose()
    }

    return $bitmap
}

function Get-BottomUpBgraBytes {
    <# Returns the bitmap pixels as bottom-up BGRA bytes, the layout used by ICO DIB frames. #>
    param([System.Drawing.Bitmap] $Bitmap)

    $rectangle = New-Object System.Drawing.Rectangle -ArgumentList 0, 0, $Bitmap.Width, $Bitmap.Height
    $data      = $Bitmap.LockBits($rectangle, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
        $stride  = $data.Stride
        $topDown = New-Object byte[] ($stride * $Bitmap.Height)
        [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $topDown, 0, $topDown.Length)
    }
    finally {
        $Bitmap.UnlockBits($data)
    }

    $rowSize  = $Bitmap.Width * 4
    $bottomUp = New-Object byte[] ($rowSize * $Bitmap.Height)
    for ($y = 0; $y -lt $Bitmap.Height; $y++) {
        [Array]::Copy($topDown, $y * $stride, $bottomUp, ($Bitmap.Height - 1 - $y) * $rowSize, $rowSize)
    }

    return , $bottomUp
}

function Get-IcoFrameBytes {
    <# Builds a single uncompressed DIB frame (BITMAPINFOHEADER + XOR bitmap + AND mask). #>
    param([System.Drawing.Bitmap] $Bitmap)

    $size       = $Bitmap.Width
    $pixels     = Get-BottomUpBgraBytes -Bitmap $Bitmap
    $maskStride = [int]([Math]::Floor(($size + 31) / 32) * 4)
    $mask       = New-Object byte[] ($maskStride * $size)

    $stream = New-Object System.IO.MemoryStream
    $writer = New-Object System.IO.BinaryWriter -ArgumentList $stream
    try {
        $writer.Write([int]40)                                # biSize
        $writer.Write([int]$size)                             # biWidth
        $writer.Write([int]($size * 2))                       # biHeight = XOR height + AND mask height
        $writer.Write([int16]1)                               # biPlanes
        $writer.Write([int16]32)                              # biBitCount
        $writer.Write([int]0)                                 # biCompression = BI_RGB
        $writer.Write([int]($pixels.Length + $mask.Length))   # biSizeImage
        $writer.Write([int]0)                                 # biXPelsPerMeter
        $writer.Write([int]0)                                 # biYPelsPerMeter
        $writer.Write([int]0)                                 # biClrUsed
        $writer.Write([int]0)                                 # biClrImportant
        $writer.Write($pixels)
        $writer.Write($mask)
        $writer.Flush()
        return , $stream.ToArray()
    }
    finally {
        $writer.Dispose()
        $stream.Dispose()
    }
}

function Write-IcoFile {
    <# Writes a multi-resolution .ico containing one DIB frame per bitmap. #>
    param(
        [System.Drawing.Bitmap[]] $Frames,
        [string] $Path
    )

    $payloads = New-Object 'System.Collections.Generic.List[byte[]]'
    foreach ($frame in $Frames) {
        $payloads.Add((Get-IcoFrameBytes -Bitmap $frame))
    }

    $stream = New-Object System.IO.MemoryStream
    $writer = New-Object System.IO.BinaryWriter -ArgumentList $stream
    try {
        $writer.Write([int16]0)              # reserved
        $writer.Write([int16]1)              # type = icon
        $writer.Write([int16]$Frames.Count)

        $offset = 6 + (16 * $Frames.Count)
        for ($i = 0; $i -lt $Frames.Count; $i++) {
            $size      = $Frames[$i].Width
            $dimension = if ($size -ge 256) { 0 } else { $size }
            $writer.Write([byte]$dimension)          # width (0 means 256)
            $writer.Write([byte]$dimension)          # height (0 means 256)
            $writer.Write([byte]0)                   # colour palette entries
            $writer.Write([byte]0)                   # reserved
            $writer.Write([int16]1)                  # colour planes
            $writer.Write([int16]32)                 # bits per pixel
            $writer.Write([int]$payloads[$i].Length) # frame data size
            $writer.Write([int]$offset)              # frame offset
            $offset += $payloads[$i].Length
        }

        foreach ($payload in $payloads) {
            $writer.Write($payload)
        }
        $writer.Flush()
    }
    finally {
        $writer.Dispose()
    }

    [System.IO.File]::WriteAllBytes($Path, $stream.ToArray())
    $stream.Dispose()
}


# ---------------------------------------------------------------- generate ----

$sourcePath = (Resolve-Path -Path $Source).Path
if (-not (Test-Path -Path $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
}
$outPath = (Resolve-Path -Path $OutDir).Path

Write-Host "Source    : $sourcePath"
# NOTE: keep this local variable named $sourceImage - PowerShell variables are
# case-insensitive, so a $source variable would collide with the [string]$Source parameter.
$sourceImage = [System.Drawing.Image]::FromFile($sourcePath)
try {
    Write-Host "Original  : $($sourceImage.Width)x$($sourceImage.Height) ($([Math]::Round((Get-Item -Path $sourcePath).Length / 1KB, 1)) KB)"

    $cropRectangle = Get-CropRectangle -Image $sourceImage -Crop $Crop
    Write-Host "Crop      : $($cropRectangle.Width)x$($cropRectangle.Height)+$($cropRectangle.X)+$($cropRectangle.Y)"

    $frames = New-Object System.Collections.ArrayList
    try {
        foreach ($size in $IcoSizes) {
            [void]$frames.Add((New-SquareBitmap -Image $sourceImage -CropRectangle $cropRectangle -Size $size))
        }

        Write-IcoFile -Frames ([System.Drawing.Bitmap[]]$frames.ToArray()) -Path (Join-Path -Path $outPath -ChildPath 'favicon.ico')
        Write-Host "Written   : favicon.ico ($($IcoSizes -join '/'))"

        foreach ($size in $PngSizes) {
            $bitmap = New-SquareBitmap -Image $sourceImage -CropRectangle $cropRectangle -Size $size
            try {
                $name = "favicon-${size}x${size}.png"
                $bitmap.Save((Join-Path -Path $outPath -ChildPath $name), [System.Drawing.Imaging.ImageFormat]::Png)
                Write-Host "Written   : $name"
            }
            finally {
                $bitmap.Dispose()
            }
        }

        $touchIcon = New-SquareBitmap -Image $sourceImage -CropRectangle $cropRectangle -Size $AppleTouchSize
        try {
            $touchIcon.Save((Join-Path -Path $outPath -ChildPath 'apple-touch-icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
            Write-Host "Written   : apple-touch-icon.png (${AppleTouchSize}x${AppleTouchSize})"
        }
        finally {
            $touchIcon.Dispose()
        }
    }
    finally {
        foreach ($frame in $frames) { $frame.Dispose() }
    }
}
finally {
    $sourceImage.Dispose()
}

Write-Host ''
Write-Host "Output    : $outPath"
Write-Host 'Done. Commit the generated icons so GitHub Pages serves them from the site root.'

