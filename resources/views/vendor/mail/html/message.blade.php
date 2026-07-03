<x-mail::layout>
{{-- Header --}}
<x-slot:header>
<x-mail::header :url="config('app.url')">
Shift <span class="brand-accent">&amp;</span> Stride <span class="brand-accent">PH</span>
<span class="brand-sub">Run for a cause</span>
</x-mail::header>
</x-slot:header>

{{-- Body --}}
{!! $slot !!}

{{-- Subcopy --}}
@isset($subcopy)
<x-slot:subcopy>
<x-mail::subcopy>
{!! $subcopy !!}
</x-mail::subcopy>
</x-slot:subcopy>
@endisset

{{-- Footer --}}
<x-slot:footer>
<x-mail::footer>
© {{ date('Y') }} Shift &amp; Stride PH. {{ __('All rights reserved.') }}
<br>This is an automated message — please do not reply to this email.
</x-mail::footer>
</x-slot:footer>
</x-mail::layout>
