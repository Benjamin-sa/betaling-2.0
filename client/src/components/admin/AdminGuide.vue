<template>
    <div class="space-y-8 max-w-5xl mx-auto pb-12">
        <!-- Header -->
        <div class="bg-gradient-to-r from-primary to-secondary text-white rounded-2xl p-8 shadow-xl">
            <div class="flex items-center space-x-4">
                <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <div>
                    <h1 class="text-3xl lg:text-4xl font-bold">📚 Admin Handleiding</h1>
                    <p class="text-emerald-100 text-base mt-1">Stap-voor-stap uitleg van alle functies</p>
                </div>
            </div>
        </div>

        <!-- Quick Navigation -->
        <div class="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
            <h2 class="text-xl font-bold text-gray-900 mb-6">🔍 Snelle Navigatie</h2>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button v-for="section in quickLinks" :key="section.id" @click="scrollToSection(section.id)"
                    class="flex flex-col items-center justify-center space-y-2 px-4 py-4 bg-gray-50 hover:bg-primary hover:text-white rounded-xl transition-all duration-200 font-medium text-gray-700 border border-gray-200 hover:border-primary hover:shadow-md">
                    <span class="text-3xl">{{ section.icon }}</span>
                    <span class="text-sm">{{ section.name }}</span>
                </button>
            </div>
        </div>

        <!-- Section 1: Events -->
        <div id="events-section" class="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg scroll-mt-8">
            <div class="flex items-start space-x-4 mb-8">
                <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span class="text-3xl">📅</span>
                </div>
                <div>
                    <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">1. Events Beheren</h2>
                    <p class="text-gray-600 text-base leading-relaxed">Maak en beheer events waar klanten producten kunnen bestellen</p>
                </div>
            </div>

            <div class="space-y-6 pl-0 lg:pl-18">
                <!-- Event Types -->
                <div class="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-6">
                    <h3 class="font-bold text-blue-900 mb-4 text-lg">📌 Twee Soorten Events:</h3>
                    <div class="space-y-5">
                        <div class="bg-white rounded-lg p-4">
                            <p class="font-bold text-blue-800 text-base mb-2">🛒 Product Verkoop</p>
                            <p class="text-blue-700 leading-relaxed">Voor gewone productverkoop zonder tijdslot-selectie. Bijvoorbeeld:
                                merchandise verkoop.</p>
                        </div>
                        <div class="bg-white rounded-lg p-4">
                            <p class="font-bold text-blue-800 text-base mb-2">⏰ Shift Event</p>
                            <p class="text-blue-700 leading-relaxed">Voor events met tijdsloten. Klanten kiezen tijdslot per product.
                                Bijvoorbeeld: spaghetti-avond met verschillende shiften.</p>
                        </div>
                    </div>
                </div>

                <!-- Create Event Steps -->
                <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 class="font-bold text-gray-900 mb-5 text-lg">✏️ Nieuw Event Aanmaken:</h3>
                    <ol class="space-y-4">
                        <li class="flex items-start leading-relaxed">
                            <span class="font-bold text-primary mr-3 text-lg flex-shrink-0">1.</span>
                            <span class="pt-0.5">Klik op de <strong>"Event Toevoegen"</strong> knop</span>
                        </li>
                        <li class="flex items-start leading-relaxed">
                            <span class="font-bold text-primary mr-3 text-lg flex-shrink-0">2.</span>
                            <div class="pt-0.5">
                                <span>Vul de <strong>naam</strong> en <strong>beschrijving</strong> in</span>
                                <div class="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p class="text-red-700 font-semibold text-sm">⚠️ LET OP: Deze verschijnen op de homepage voor alle klanten!</p>
                                </div>
                            </div>
                        </li>
                        <li class="flex items-start leading-relaxed">
                            <span class="font-bold text-primary mr-3 text-lg flex-shrink-0">3.</span>
                            <span class="pt-0.5">Kies het <strong>event type</strong> (Product Verkoop of Shift Event)</span>
                        </li>
                        <li class="flex items-start leading-relaxed">
                            <span class="font-bold text-primary mr-3 text-lg flex-shrink-0">4.</span>
                            <span class="pt-0.5">Stel <strong>start- en einddatum</strong> in</span>
                        </li>
                        <li class="flex items-start leading-relaxed">
                            <span class="font-bold text-primary mr-3 text-lg flex-shrink-0">5.</span>
                            <div class="pt-0.5">
                                <span><strong>Voor Shift Events:</strong> Voeg tijdsloten (shifts) toe met:</span>
                                <ul class="ml-6 mt-3 space-y-2 text-gray-700">
                                    <li class="flex items-start">
                                        <span class="text-primary mr-2">•</span>
                                        <span>Naam (bijv. "Shift 1", "18:00-20:00")</span>
                                    </li>
                                    <li class="flex items-start">
                                        <span class="text-primary mr-2">•</span>
                                        <span>Start- en eindtijd</span>
                                    </li>
                                    <li class="flex items-start">
                                        <span class="text-primary mr-2">•</span>
                                        <span>Maximale capaciteit (aantal plaatsen)</span>
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li class="flex items-start leading-relaxed">
                            <span class="font-bold text-primary mr-3 text-lg flex-shrink-0">6.</span>
                            <span class="pt-0.5">Zet het event <strong>actief</strong> via de toggle (groen = actief)</span>
                        </li>
                    </ol>
                </div>

                <!-- Tips -->
                <div class="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h3 class="font-bold text-green-900 mb-4 text-lg">💡 Tips:</h3>
                    <ul class="space-y-3 text-green-800 leading-relaxed">
                        <li class="flex items-start">
                            <span class="text-green-600 mr-3 text-lg flex-shrink-0">•</span>
                            <span>Gebruik duidelijke namen (bijv. "Spaghetti Avond Maart 2025")</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-green-600 mr-3 text-lg flex-shrink-0">•</span>
                            <span>Bij Shift Events: zorg voor voldoende capaciteit per shift</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Section 2: Products -->
        <div id="products-section" class="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg scroll-mt-8">
            <div class="flex items-start space-x-4 mb-8">
                <div class="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span class="text-3xl">📦</span>
                </div>
                <div>
                    <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">2. Producten Beheren</h2>
                    <p class="text-gray-600 text-base leading-relaxed">Voeg producten toe aan je events</p>
                </div>
            </div>

            <div class="space-y-6 pl-0 lg:pl-18">
                <!-- Stripe Mode Warning -->
                <div class="bg-orange-50 border-l-4 border-orange-500 rounded-r-xl p-6">
                    <h3 class="font-bold text-orange-900 mb-4 text-lg">⚠️ LET OP: Stripe Modus</h3>
                    <div class="space-y-4 text-orange-800 leading-relaxed">
                        <div class="bg-white rounded-lg p-4">
                            <p class="font-bold mb-2">🧪 Test Modus:</p>
                            <p>Klanten kunnen NIET betalen. Alleen voor ontwikkeling.</p>
                        </div>
                        <div class="bg-white rounded-lg p-4">
                            <p class="font-bold mb-2">✅ Live Modus:</p>
                            <p>Klanten kunnen echte betalingen doen.</p>
                        </div>
                        <div class="bg-orange-100 border border-orange-300 rounded-lg p-4">
                            <p class="font-bold">👉 Schakel naar Live Modus in het "Stripe Config" tabblad voordat
                                je echte producten aanmaakt!</p>
                        </div>
                    </div>
                </div>

                <!-- Create Product Steps -->
                <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 class="font-bold text-gray-900 mb-5 text-lg">✏️ Nieuw Product Toevoegen:</h3>
                    <ol class="space-y-4">
                        <li class="flex items-start leading-relaxed">
                            <span class="font-bold text-primary mr-3 text-lg flex-shrink-0">1.</span>
                            <span class="pt-0.5">Vul de <strong>productnaam</strong> in (bijv. "Grote Spaghetti")</span>
                        </li>
                        <li class="flex items-start leading-relaxed">
                            <span class="font-bold text-primary mr-3 text-lg flex-shrink-0">2.</span>
                            <span class="pt-0.5">Schrijf een duidelijke <strong>beschrijving</strong></span>
                        </li>
                        <li class="flex items-start leading-relaxed">
                            <span class="font-bold text-primary mr-3 text-lg flex-shrink-0">3.</span>
                            <span class="pt-0.5">Stel de <strong>prijs</strong> in (in euro's, bijv. 12.50)</span>
                        </li>
                        <li class="flex items-start leading-relaxed">
                            <span class="font-bold text-primary mr-3 text-lg flex-shrink-0">4.</span>
                            <span class="pt-0.5">Selecteer het <strong>event</strong> waar dit product bij hoort</span>
                        </li>
                        <li class="flex items-start leading-relaxed">
                            <span class="font-bold text-primary mr-3 text-lg flex-shrink-0">5.</span>
                            <div class="pt-0.5">
                                <span><strong>Upload afbeeldingen</strong> (optioneel, max 5 stuks):</span>
                                <ul class="ml-6 mt-3 space-y-2 text-gray-700">
                                    <li class="flex items-start">
                                        <span class="text-primary mr-2">•</span>
                                        <span>Sleep bestanden naar het uploadvak of klik om te selecteren</span>
                                    </li>
                                    <li class="flex items-start">
                                        <span class="text-primary mr-2">•</span>
                                        <span>Ondersteunde formaten: PNG, JPG, WebP</span>
                                    </li>
                                    <li class="flex items-start">
                                        <span class="text-primary mr-2">•</span>
                                        <span>Maximale grootte: 5MB per afbeelding</span>
                                    </li>
                                    <li class="flex items-start">
                                        <span class="text-primary mr-2">•</span>
                                        <span>Eerste afbeelding wordt gebruikt als hoofdafbeelding</span>
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li class="flex items-start leading-relaxed">
                            <span class="font-bold text-primary mr-3 text-lg flex-shrink-0">6.</span>
                            <span class="pt-0.5"><strong>Voor Shift Events:</strong> Vink "Vereist tijdslot selectie" aan als klanten
                                een shift moeten kiezen</span>
                        </li>
                        <li class="flex items-start leading-relaxed">
                            <span class="font-bold text-primary mr-3 text-lg flex-shrink-0">7.</span>
                            <span class="pt-0.5">Klik op <strong>"Product Toevoegen"</strong></span>
                        </li>
                    </ol>
                </div>

                <!-- Product Badges Explanation -->
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 class="font-bold text-blue-900 mb-4 text-lg">🏷️ Product Badges:</h3>
                    <ul class="space-y-3 text-blue-800 leading-relaxed">
                        <li class="flex items-start">
                            <span class="text-blue-600 mr-3 text-lg flex-shrink-0">•</span>
                            <span><span class="font-semibold">⏰ Tijdslot vereist:</span> Product vereist shift-selectie</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-blue-600 mr-3 text-lg flex-shrink-0">•</span>
                            <span><span class="font-semibold">🧪 Test:</span> Product kan niet door klanten worden betaald</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-blue-600 mr-3 text-lg flex-shrink-0">•</span>
                            <span><span class="font-semibold">✅ Live:</span> Product kan door klanten worden betaald</span>
                        </li>
                    </ul>
                </div>

            
            </div>
        </div>

        <!-- Section 3: Stripe Config -->
        <div id="stripe-section" class="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg scroll-mt-8">
            <div class="flex items-start space-x-4 mb-8">
                <div class="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span class="text-3xl">💳</span>
                </div>
                <div>
                    <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">3. Stripe Configuratie</h2>
                    <p class="text-gray-600 text-base leading-relaxed">Beheer test en live betalingen</p>
                </div>
            </div>

            <div class="space-y-6 pl-0 lg:pl-18">
                <!-- Modes Explanation -->
                <div class="bg-orange-50 border-l-4 border-orange-500 rounded-r-xl p-6">
                    <h3 class="font-bold text-orange-900 mb-5 text-lg">🔄 Twee Modi:</h3>
                    <div class="space-y-4">
                        <div class="bg-white rounded-lg p-5 border border-orange-200">
                            <p class="font-bold text-orange-800 mb-3 text-base">🧪 Test Modus (Ontwikkeling)</p>
                            <ul class="space-y-2 text-orange-700 leading-relaxed">
                                <li class="flex items-start">
                                    <span class="text-orange-500 mr-2">•</span>
                                    <span>Klanten kunnen NIET betalen</span>
                                </li>
                                <li class="flex items-start">
                                    <span class="text-orange-500 mr-2">•</span>
                                    <span>Alleen voor testen en ontwikkeling</span>
                                </li>
                                <li class="flex items-start">
                                    <span class="text-orange-500 mr-2">•</span>
                                    <span>Nieuwe producten zijn test-producten</span>
                                </li>
                                <li class="flex items-start">
                                    <span class="text-orange-500 mr-2">•</span>
                                    <span>Geen echt geld betrokken</span>
                                </li>
                            </ul>
                        </div>
                        <div class="bg-white rounded-lg p-5 border border-green-200">
                            <p class="font-bold text-green-800 mb-3 text-base">✅ Live Modus (Productie)</p>
                            <ul class="space-y-2 text-green-700 leading-relaxed">
                                <li class="flex items-start">
                                    <span class="text-green-500 mr-2">•</span>
                                    <span>Klanten kunnen echte betalingen doen</span>
                                </li>
                                <li class="flex items-start">
                                    <span class="text-green-500 mr-2">•</span>
                                    <span>Voor echte verkoop</span>
                                </li>
                                <li class="flex items-start">
                                    <span class="text-green-500 mr-2">•</span>
                                    <span>Nieuwe producten zijn live producten</span>
                                </li>
                                <li class="flex items-start">
                                    <span class="text-green-500 mr-2">•</span>
                                    <span>Echt geld wordt verwerkt</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- How to Switch -->
                <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 class="font-bold text-gray-900 mb-5 text-lg">🔄 Modus Wisselen:</h3>
                    <ol class="space-y-4">
                        <li class="flex items-start leading-relaxed">
                            <span class="font-bold text-primary mr-3 text-lg flex-shrink-0">1.</span>
                            <span class="pt-0.5">Ga naar het <strong>"Stripe Config"</strong> tabblad</span>
                        </li>
                        <li class="flex items-start leading-relaxed">
                            <span class="font-bold text-primary mr-3 text-lg flex-shrink-0">2.</span>
                            <span class="pt-0.5">Zie de huidige modus bovenaan (oranje = test, groen = live)</span>
                        </li>
                        <li class="flex items-start leading-relaxed">
                            <span class="font-bold text-primary mr-3 text-lg flex-shrink-0">3.</span>
                            <span class="pt-0.5">Klik op <strong>"Wissel naar Live Modus"</strong> of <strong>"Wissel naar Test
                                    Modus"</strong></span>
                        </li>
                        <li class="flex items-start leading-relaxed">
                            <span class="font-bold text-primary mr-3 text-lg flex-shrink-0">4.</span>
                            <span class="pt-0.5">Bevestig de waarschuwing (let op: onmiddellijk effect!)</span>
                        </li>
                        <li class="flex items-start leading-relaxed">
                            <span class="font-bold text-primary mr-3 text-lg flex-shrink-0">5.</span>
                            <span class="pt-0.5">Controleer of de nieuwe modus actief is</span>
                        </li>
                    </ol>
                </div>

                <!-- Critical Warning -->
                <div class="bg-red-50 border-2 border-red-500 rounded-xl p-6">
                    <h3 class="font-bold text-red-900 mb-4 text-lg">🚨 BELANGRIJK:</h3>
                    <ul class="space-y-3 text-red-800 leading-relaxed">
                        <li class="flex items-start">
                            <span class="text-red-600 mr-3 text-lg flex-shrink-0">•</span>
                            <span><strong>Ga ALTIJD naar Live Modus voordat je de webshop opent voor klanten!</strong></span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-red-600 mr-3 text-lg flex-shrink-0">•</span>
                            <span>Test-producten en Live-producten kunnen NIET worden gemixt</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-red-600 mr-3 text-lg flex-shrink-0">•</span>
                            <span>Wisselen heeft onmiddellijk effect op nieuwe bestellingen</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-red-600 mr-3 text-lg flex-shrink-0">•</span>
                            <span>Controleer de modus voordat je producten aanmaakt</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Section 4: Google Services -->
        <div id="google-section" class="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg scroll-mt-8">
            <div class="flex items-start space-x-4 mb-8">
                <div class="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span class="text-3xl">🌐</span>
                </div>
                <div>
                    <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">4. Google Services</h2>
                    <p class="text-gray-600 text-base leading-relaxed">Gmail verbinding voor het versturen van emails</p>
                </div>
            </div>

            <div class="space-y-6 pl-0 lg:pl-18">
                <!-- CRITICAL: Gmail Connection -->
                <div class="bg-red-50 border-2 border-red-500 rounded-xl p-6">
                    <h3 class="font-bold text-red-900 mb-4 text-lg">🚨 BELANGRIJK - Gmail Verbinding:</h3>
                    <div class="space-y-4 text-red-800">
                        <div class="bg-white rounded-lg p-4 border border-red-300">
                            <p class="font-bold text-base leading-relaxed">Dit MOET verbonden zijn om orderbevestigings-emails te kunnen versturen!</p>
                        </div>
                        <ul class="space-y-3 leading-relaxed">
                            <li class="flex items-start">
                                <span class="mr-3 flex-shrink-0 text-lg">📧</span>
                                <span><strong>Controleer ALTIJD</strong> of de Gmail verbinding actief is</span>
                            </li>
                            <li class="flex items-start">
                                <span class="mr-3 flex-shrink-0 text-lg">🔄</span>
                                <span>Als de verbinding niet actief is, moet je <strong>opnieuw inloggen</strong></span>
                            </li>
                            <li class="flex items-start">
                                <span class="mr-3 flex-shrink-0 text-lg">👤</span>
                                <span>Het <strong>Google account waarmee je inlogt</strong> wordt gebruikt om de emails te versturen</span>
                            </li>
                            <li class="flex items-start">
                                <span class="mr-3 flex-shrink-0 text-lg">⚠️</span>
                                <span>Zonder actieve verbinding worden GEEN orderbevestigingen verzonden!</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- How to Connect -->
                <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 class="font-bold text-gray-900 mb-5 text-lg">🔗 Gmail Verbinden:</h3>
                    <ol class="space-y-4">
                        <li class="flex items-start leading-relaxed">
                            <span class="font-bold text-primary mr-3 text-lg flex-shrink-0">1.</span>
                            <span class="pt-0.5">Ga naar het <strong>"Google Services"</strong> tabblad</span>
                        </li>
                        <li class="flex items-start leading-relaxed">
                            <span class="font-bold text-primary mr-3 text-lg flex-shrink-0">2.</span>
                            <span class="pt-0.5">Controleer de <strong>authenticatie-status</strong> bovenaan</span>
                        </li>
                        <li class="flex items-start leading-relaxed">
                            <span class="font-bold text-primary mr-3 text-lg flex-shrink-0">3.</span>
                            <div class="pt-0.5">
                                <span>Als <strong class="text-red-600">NIET verbonden</strong>:</span>
                                <ul class="ml-6 mt-3 space-y-2 text-gray-700">
                                    <li class="flex items-start">
                                        <span class="text-primary mr-2">•</span>
                                        <span>Klik op <strong>"Login met Google"</strong></span>
                                    </li>
                                    <li class="flex items-start">
                                        <span class="text-primary mr-2">•</span>
                                        <span>Kies het Google account dat je wilt gebruiken</span>
                                    </li>
                                    <li class="flex items-start">
                                        <span class="text-primary mr-2">•</span>
                                        <span>Geef toestemming voor Gmail toegang</span>
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li class="flex items-start leading-relaxed">
                            <span class="font-bold text-primary mr-3 text-lg flex-shrink-0">4.</span>
                            <span class="pt-0.5">Wacht tot de status <strong class="text-green-600">✅ Verbonden</strong> toont</span>
                        </li>
                    </ol>
                </div>

                <!-- Status Indicators -->
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 class="font-bold text-blue-900 mb-4 text-lg">🏷️ Status Indicatoren:</h3>
                    <ul class="space-y-3 text-blue-800 leading-relaxed">
                        <li class="flex items-start">
                            <span class="text-blue-600 mr-3 text-lg flex-shrink-0">•</span>
                            <span><span class="font-semibold">✅ Verbonden:</span> Gmail werkt, emails worden verzonden</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-blue-600 mr-3 text-lg flex-shrink-0">•</span>
                            <span><span class="font-semibold">❌ Niet Verbonden:</span> Gmail werkt NIET, login vereist</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-blue-600 mr-3 text-lg flex-shrink-0">•</span>
                            <span><span class="font-semibold">⚠️ Verlopen:</span> Token verlopen, opnieuw inloggen vereist</span>
                        </li>
                    </ul>
                </div>

                <!-- Tips -->
                <div class="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h3 class="font-bold text-green-900 mb-4 text-lg">💡 Tips:</h3>
                    <ul class="space-y-3 text-green-800 leading-relaxed">
                        <li class="flex items-start">
                            <span class="text-green-600 mr-3 text-lg flex-shrink-0">•</span>
                            <span>Controleer de Gmail verbinding voordat je een event live zet</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-green-600 mr-3 text-lg flex-shrink-0">•</span>
                            <span>Gebruik een professioneel email account (bijv. groepsleiding@lodlavki.be)</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-green-600 mr-3 text-lg flex-shrink-0">•</span>
                            <span>Test de email-functionaliteit met een test-bestelling</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-green-600 mr-3 text-lg flex-shrink-0">•</span>
                            <span>Als emails niet aankomen, controleer eerst de Gmail verbinding</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Best Practices Section -->
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-8 shadow-lg">
            <div class="flex items-start space-x-4 mb-8">
                <div class="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span class="text-3xl text-white">⭐</span>
                </div>
                <div>
                    <h2 class="text-2xl lg:text-3xl font-bold text-green-900 mb-2">Best Practices & Tips</h2>
                    <p class="text-green-700 text-base leading-relaxed">Volg deze richtlijnen voor een soepele werking</p>
                </div>
            </div>

            <div class="pl-0 lg:pl-18">
                <div class="bg-white rounded-xl p-6 border border-green-200 shadow-sm">
                    <h3 class="font-bold text-green-900 mb-5 text-lg">✅ Checklist voor Go-Live:</h3>
                    <ul class="space-y-3 text-green-800 leading-relaxed">
                        <li class="flex items-start">
                            <span class="text-green-600 mr-3 flex-shrink-0 text-lg">☐</span>
                            <span>Stripe is in <strong>Live Modus</strong></span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-green-600 mr-3 flex-shrink-0 text-lg">☐</span>
                            <span>Alle producten zijn <strong>Live producten</strong> (groene badge)</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-green-600 mr-3 flex-shrink-0 text-lg">☐</span>
                            <span>Events hebben correcte <strong>datums en tijden</strong></span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-green-600 mr-3 flex-shrink-0 text-lg">☐</span>
                            <span>Voor Shift Events: <strong>voldoende capaciteit</strong> per shift</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-green-600 mr-3 flex-shrink-0 text-lg">☐</span>
                            <span>Productafbeeldingen zijn <strong>hoogwaardig</strong></span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-green-600 mr-3 flex-shrink-0 text-lg">☐</span>
                            <span>Prijzen zijn <strong>correct</strong></span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-green-600 mr-3 flex-shrink-0 text-lg">☐</span>
                            <span>Events zijn <strong>actief</strong> (groene toggle)</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-green-600 mr-3 flex-shrink-0 text-lg">☐</span>
                            <span>Email confirmatie werkt</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Troubleshooting Section -->
        <div class="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-8 shadow-lg">
            <div class="flex items-start space-x-4 mb-8">
                <div class="w-14 h-14 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span class="text-3xl">🔧</span>
                </div>
                <div>
                    <h2 class="text-2xl lg:text-3xl font-bold text-yellow-900 mb-2">Veelvoorkomende Problemen</h2>
                    <p class="text-yellow-700 text-base leading-relaxed">Oplossingen voor veel voorkomende issues</p>
                </div>
            </div>

            <div class="pl-0 lg:pl-18 space-y-4">
                <div class="bg-white rounded-xl p-6 border border-yellow-200 shadow-sm">
                    <h3 class="font-bold text-yellow-900 mb-3 text-base">❌ "Klanten kunnen niet betalen"</h3>
                    <p class="text-gray-700 leading-relaxed"><strong class="text-yellow-800">Oplossing:</strong> Controleer of Stripe in <strong>Live
                            Modus</strong> staat en of producten de groene <strong>✅ Live</strong> badge hebben.</p>
                </div>

                <div class="bg-white rounded-xl p-6 border border-yellow-200 shadow-sm">
                    <h3 class="font-bold text-yellow-900 mb-3 text-base">❌ "Kan test en live producten niet mixen"</h3>
                    <p class="text-gray-700 leading-relaxed"><strong class="text-yellow-800">Oplossing:</strong> Verwijder alle test-producten (🧪
                        badge) en maak nieuwe producten aan in Live Modus.</p>
                </div>

                <div class="bg-white rounded-xl p-6 border border-yellow-200 shadow-sm">
                    <h3 class="font-bold text-yellow-900 mb-3 text-base">❌ "Emails worden niet verzonden"</h3>
                    <p class="text-gray-700 leading-relaxed"><strong class="text-yellow-800">Oplossing:</strong> Controleer Google Services configuratie
                        en Gmail API authenticatie.</p>
                </div>

                <div class="bg-white rounded-xl p-6 border border-yellow-200 shadow-sm">
                    <h3 class="font-bold text-yellow-900 mb-3 text-base">❌ "Producten verschijnen niet op de webshop"</h3>
                    <p class="text-gray-700 leading-relaxed"><strong class="text-yellow-800">Oplossing:</strong> Controleer of het event <strong>actief
                            is</strong> (groene toggle) en of de datums correct zijn ingesteld.</p>
                </div>
            </div>
        </div>

        <!-- Support Section -->
        <div class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-8 shadow-xl">
            <div class="flex items-start space-x-4 mb-6">
                <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span class="text-3xl">💬</span>
                </div>
                <div>
                    <h2 class="text-2xl lg:text-3xl font-bold mb-2">Hulp Nodig?</h2>
                    <p class="text-blue-100 text-base leading-relaxed">Als je problemen ondervindt of vragen hebt:</p>
                </div>
            </div>
            <div class="pl-0 lg:pl-18 space-y-4">
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                    <p class="flex items-start leading-relaxed">
                        <span class="mr-3 flex-shrink-0 text-xl">📧</span>
                        <span>Email: <a href="mailto:benjamin.sautersb@gmail.com"
                                class="underline font-semibold hover:text-blue-200">benjamin.sautersb@gmail.com</a></span>
                    </p>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                    <p class="flex items-start leading-relaxed">
                        <span class="mr-3 flex-shrink-0 text-xl">📖</span>
                        <span>Documentatie: Bekijk deze handleiding regelmatig voor updates</span>
                    </p>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                    <p class="flex items-start leading-relaxed">
                        <span class="mr-3 flex-shrink-0 text-xl">🧪</span>
                        <span>Test eerst: Gebruik altijd Test Modus voordat je live gaat</span>
                    </p>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                    <p class="flex items-start leading-relaxed">
                        <span class="mr-3 flex-shrink-0 text-xl">📞</span>
                        <span>Bij dringende problemen bel +32 493789131</span>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const quickLinks = [
    { id: 'events-section', name: 'Events', icon: '📅' },
    { id: 'products-section', name: 'Producten', icon: '📦' },
    { id: 'stripe-section', name: 'Stripe', icon: '💳' },
    { id: 'google-section', name: 'Google', icon: '🌐' },
];

const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};
</script>

<style scoped>
/* Smooth scroll behavior with offset for fixed headers */
html {
    scroll-behavior: smooth;
}

.scroll-mt-8 {
    scroll-margin-top: 2rem;
}

/* Animation for fade in */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
}

/* Responsive padding for nested content */
@media (max-width: 1024px) {
    .lg\:pl-18 {
        padding-left: 0;
    }
}
</style>
