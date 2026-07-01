<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    @php
        $landscape = ($template->orientation ?? 'landscape') === 'landscape';
        $w = $landscape ? '297mm' : '210mm';
        $h = $landscape ? '210mm' : '297mm';
        $accent = $template->accent_color ?: '#a6e212';
    @endphp
    <style>
        @page { margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; }
        .page {
            position: relative;
            width: {{ $w }};
            height: {{ $h }};
            background-color: #12150d;
            color: #eef2e8;
        }
        .bg {
            position: absolute;
            top: 0; left: 0;
            width: {{ $w }};
            height: {{ $h }};
        }
        .veil {
            position: absolute;
            top: 0; left: 0;
            width: {{ $w }};
            height: {{ $h }};
            background-color: rgba(10, 12, 7, 0.55);
        }
        .frame {
            position: absolute;
            top: 14mm; left: 14mm; right: 14mm; bottom: 14mm;
            width: auto;
            border: 2px solid {{ $accent }};
        }
        .inner { padding: 16mm 18mm 12mm; text-align: center; }
        .brand {
            color: {{ $accent }};
            font-size: 13px;
            letter-spacing: 6px;
            text-transform: uppercase;
            font-weight: bold;
        }
        .logo { height: 46px; margin-bottom: 6mm; }
        .title {
            font-family: DejaVu Serif, serif;
            font-size: 34px;
            font-style: italic;
            text-transform: uppercase;
            color: #ffffff;
            margin-top: 6mm;
            letter-spacing: 2px;
        }
        .sub { color: #9aa48c; font-size: 13px; margin-top: 4mm; }
        .name {
            font-family: DejaVu Serif, serif;
            font-size: 46px;
            font-style: italic;
            color: #ffffff;
            margin-top: 5mm;
        }
        .rule {
            width: 70mm;
            height: 2px;
            background-color: {{ $accent }};
            margin: 4mm auto 6mm;
        }
        .body {
            font-size: 15px;
            line-height: 1.7;
            color: #c9d1be;
            width: 150mm;
            margin: 0 auto;
        }
        .body .hl { color: {{ $accent }}; }
        .footer { width: 100%; margin-top: 14mm; }
        .footer td { vertical-align: bottom; font-size: 12px; }
        .col-left { text-align: left; color: #9aa48c; width: 33%; }
        .col-left .val { color: #c9d1be; font-size: 12px; }
        .col-mid { text-align: center; width: 34%; }
        .sig { height: 40px; }
        .sigline { width: 60mm; border-top: 1px solid #6f7a60; margin: 1mm auto 2mm; }
        .signame { color: #ffffff; font-size: 13px; }
        .sigtitle { color: #9aa48c; font-size: 11px; }
        .col-right { text-align: right; color: #9aa48c; width: 33%; font-size: 10px; }
    </style>
</head>
<body>
    <div class="page">
        @if (! empty($backgroundSrc))
            <img class="bg" src="{{ $backgroundSrc }}" alt="">
            <div class="veil"></div>
        @endif

        <div class="frame">
            <div class="inner">
                @if (! empty($logoSrc))
                    <img class="logo" src="{{ $logoSrc }}" alt="">
                @endif

                <div class="brand">Shift &amp; Stride PH</div>
                <div class="title">{{ $title }}</div>
                <div class="sub">This certifies that</div>
                <div class="name">{{ $data['runner_name'] }}</div>
                <div class="rule"></div>
                <div class="body">{!! $body !!}</div>

                <table class="footer">
                    <tr>
                        <td class="col-left">
                            Serial No.
                            <div class="val">{{ $data['serial'] }}</div>
                        </td>
                        <td class="col-mid">
                            @if (! empty($signatureSrc))
                                <img class="sig" src="{{ $signatureSrc }}" alt="">
                            @endif
                            <div class="sigline"></div>
                            <div class="signame">{{ $template->signatory_name ?: 'Race Director' }}</div>
                            <div class="sigtitle">{{ $template->signatory_title ?: 'Shift & Stride PH' }}</div>
                        </td>
                        <td class="col-right">&nbsp;</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</body>
</html>
