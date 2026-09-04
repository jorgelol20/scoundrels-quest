<x-mail::layout>
    {{-- Header --}}
    <x-slot:header>
        <x-mail::header :url="config('app.frontend_url')">
            {{ config('app.name') }}
        </x-mail::header>
    </x-slot:header>

    {{-- Body --}}
    {!! $slot !!}

    {{-- Subcopy --}}
    <x-slot:subcopy>
        <div style="text-align: center; margin-top: 20px;">
            Att: El equipo de Scoundrel's Quest
        </div>
    </x-slot:subcopy>

    {{-- Footer --}}
    <x-slot:footer>
        <x-mail::footer>
            <strong>Scoundrel's Quest</strong>

            <p>
                <img src="{{ config('app.frontend_url') }}/images/shopman/Happy.webp" alt="Scoundrel's Quest">
            </p>

            <p>
                <a href="{{ config('app.frontend_url') }}/privacy">
                    Privacidad
                </a>
                &nbsp;·&nbsp;
                <a href="{{ config('app.frontend_url') }}/terms">
                    Términos de uso
                </a>
                &nbsp;·&nbsp;
                <a href="{{ config('app.frontend_url') }}/cookies">
                    Cookies
                </a>
                &nbsp;·&nbsp;
                <a href="{{ config('app.frontend_url') }}/legal">
                    Información legal
                </a>
            </p>

            <p>
                <a href="mailto:soporte@scoundrels-quest.com">
                    soporte@scoundrels-quest.com
                </a>
            </p>

            <p>
                © {{ date('Y') }} Scoundrel's Quest.
                Todos los derechos reservados.
            </p>
        </x-mail::footer>
    </x-slot:footer>
</x-mail::layout>