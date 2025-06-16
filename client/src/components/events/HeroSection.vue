<template>
    <div class="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
        <!-- Dynamic Background with Multiple Layers -->
        <div class="absolute inset-0">
            <!-- Primary Background Image -->
            <div class="absolute inset-0">
                <img src="/src/assets/groepsfoto.jpg" alt="Scouts Lod Lavki groepsfoto"
                    class="w-full h-full object-cover object-center scale-105 transform transition-transform duration-[10s] ease-out" />
                <!-- Multi-layered overlay for better contrast -->
                <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60"></div>
                <div class="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-green-600/20"></div>
            </div>

            <!-- Animated Geometric Overlays -->
            <div class="absolute inset-0 opacity-30">
                <!-- Large floating elements -->
                <div
                    class="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-primary/30 to-green-400/20 rounded-full blur-3xl animate-pulse">
                </div>
                <div
                    class="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-green-600/25 to-primary/15 rounded-full blur-2xl animate-pulse delay-1000">
                </div>

                <!-- Grid pattern overlay -->
                <svg class="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="hero-grid" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                            <circle cx="50" cy="50" r="2" fill="currentColor" class="text-white" />
                            <circle cx="0" cy="0" r="1" fill="currentColor" class="text-primary" />
                            <circle cx="100" cy="100" r="1" fill="currentColor" class="text-green-400" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#hero-grid)" />
                </svg>
            </div>

            <!-- Animated light rays -->
            <div class="absolute inset-0 opacity-20">
                <div
                    class="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-primary/60 via-transparent to-transparent transform rotate-12 animate-pulse delay-500">
                </div>
                <div
                    class="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-green-400/40 via-transparent to-transparent transform -rotate-12 animate-pulse delay-1500">
                </div>
            </div>
        </div>

        <!-- Main Content Container -->
        <div class="relative z-10 w-full">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center">
                    <!-- Animated Entry Content -->
                    <div class="animate-hero-entrance">
                        <!-- Stunning Universal Title -->
                        <div class="mb-12">
                            <h1
                                class="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] font-black tracking-tight text-white mb-6 leading-none">
                                <span class="block opacity-0 animate-slide-up-1">
                                    {{ selectedEvent?.name || 'Scouts' }}
                                </span>
                                <span
                                    class="block opacity-0 animate-slide-up-2 text-transparent bg-clip-text bg-gradient-to-r from-primary via-green-400 to-green-300 text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl mt-2">
                                    Lod Lavki
                                </span>
                            </h1>
                        </div>

                        <!-- Universal Description -->
                        <div class="opacity-0 animate-fade-up-4 mb-16">
                            <p
                                class="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-100 font-light leading-relaxed max-w-5xl mx-auto">
                                {{ selectedEvent?.description ||
                                    'Beleef onvergetelijke momenten samen met onze scouts groep' }}
                            </p>
                        </div>

                        <!-- Universal Call to Action -->
                        <div
                            class="opacity-0 animate-fade-up-6 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                            <button @click="scrollToProducts"
                                class="group relative px-6 py-3 sm:px-8 sm:py-4 md:px-12 md:py-6 bg-gradient-to-r from-primary via-green-500 to-green-600 text-white text-base sm:text-lg md:text-xl font-black rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-primary/30 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 overflow-hidden w-full sm:w-auto max-w-xs sm:max-w-none">
                                <!-- Animated background -->
                                <div
                                    class="absolute inset-0 bg-gradient-to-r from-green-600 via-primary to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                </div>

                                <!-- Shine effect -->
                                <div
                                    class="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent">
                                </div>

                                <span class="relative flex items-center justify-center z-10">
                                    Ontdek Nu
                                    <svg class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ml-2 sm:ml-3 group-hover:translate-x-2 transition-transform duration-300"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                            d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Enhanced Bottom Elements -->
        <div class="absolute bottom-0 left-0 right-0 z-20">
            <!-- Enhanced Photo Caption -->
            <div
                class="absolute bottom-8 right-8 text-sm text-white/90 bg-black/50 px-6 py-3 rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl hover:bg-black/70 transition-all duration-300">
                <div class="flex items-center space-x-3">
                    <div
                        class="w-8 h-8 bg-gradient-to-br from-primary to-green-400 rounded-full flex items-center justify-center">
                        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <div class="font-semibold">Scouts Lod Lavki</div>
                        <div class="text-xs text-white/70">Groepsfoto 2024</div>
                    </div>
                </div>
            </div>


        </div>

        <!-- Parallax Elements for Extra Depth -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
            <!-- Floating particles -->
            <div class="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-float-1"></div>
            <div class="absolute top-1/3 right-1/4 w-1 h-1 bg-primary/50 rounded-full animate-float-2"></div>
            <div class="absolute bottom-1/3 left-1/3 w-3 h-3 bg-green-400/30 rounded-full animate-float-3"></div>
            <div class="absolute top-2/3 right-1/3 w-1.5 h-1.5 bg-white/40 rounded-full animate-float-4"></div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    selectedEvent: {
        type: Object,
        default: null
    }
});

defineEmits(['scroll-to-products']);

const scrollToProducts = () => {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
        productsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
};
</script>

<style scoped>
/* Advanced Animation Keyframes */
@keyframes hero-entrance {
    0% {
        opacity: 0;
        transform: translateY(60px) scale(0.95);
    }

    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes slide-up-1 {
    0% {
        opacity: 0;
        transform: translateY(100px) rotateX(45deg);
    }

    100% {
        opacity: 1;
        transform: translateY(0) rotateX(0);
    }
}

@keyframes slide-up-2 {
    0% {
        opacity: 0;
        transform: translateY(120px) rotateX(45deg);
    }

    100% {
        opacity: 1;
        transform: translateY(0) rotateX(0);
    }
}

@keyframes fade-up-4 {
    0% {
        opacity: 0;
        transform: translateY(80px);
    }

    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fade-up-6 {
    0% {
        opacity: 0;
        transform: translateY(40px);
    }

    100% {
        opacity: 1;
        transform: translateY(0);
    }
}


@keyframes float-1 {

    0%,
    100% {
        transform: translateY(0px) translateX(0px);
    }

    33% {
        transform: translateY(-20px) translateX(10px);
    }

    66% {
        transform: translateY(-10px) translateX(-5px);
    }
}

@keyframes float-2 {

    0%,
    100% {
        transform: translateY(0px) translateX(0px);
    }

    50% {
        transform: translateY(-30px) translateX(-15px);
    }
}

@keyframes float-3 {

    0%,
    100% {
        transform: translateY(0px) translateX(0px);
    }

    25% {
        transform: translateY(-15px) translateX(20px);
    }

    75% {
        transform: translateY(-25px) translateX(-10px);
    }
}

@keyframes float-4 {

    0%,
    100% {
        transform: translateY(0px) translateX(0px);
    }

    40% {
        transform: translateY(-25px) translateX(15px);
    }

    80% {
        transform: translateY(-5px) translateX(-20px);
    }
}

/* Animation Classes */
.animate-hero-entrance {
    animation: hero-entrance 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.animate-slide-up-1 {
    animation: slide-up-1 1s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
}

.animate-slide-up-2 {
    animation: slide-up-2 1s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards;
}

.animate-fade-up-4 {
    animation: fade-up-4 1s cubic-bezier(0.4, 0, 0.2, 1) 0.8s forwards;
}

.animate-fade-up-6 {
    animation: fade-up-6 1s cubic-bezier(0.4, 0, 0.2, 1) 1.2s forwards;
}

.animate-bounce-slow {
    animation: bounce-slow 3s infinite;
}

.animate-float-1 {
    animation: float-1 6s ease-in-out infinite;
}

.animate-float-2 {
    animation: float-2 8s ease-in-out infinite;
}

.animate-float-3 {
    animation: float-3 7s ease-in-out infinite;
}

.animate-float-4 {
    animation: float-4 9s ease-in-out infinite;
}

/* Responsive Typography */
@media (max-width: 640px) {
    h1 {
        font-size: 4rem !important;
        line-height: 1.05 !important;
    }

    .text-xl {
        font-size: 1.125rem !important;
    }
}

@media (max-width: 480px) {
    h1 {
        font-size: 3.5rem !important;
        line-height: 1.05 !important;
    }

    .text-xl {
        font-size: 1rem !important;
    }
}

/* Performance Optimizations */
.transform {
    transform-style: preserve-3d;
    backface-visibility: hidden;
}

/* Blur backdrop fallback for older browsers */
@supports not (backdrop-filter: blur(10px)) {
    .backdrop-blur-lg {
        background-color: rgba(0, 0, 0, 0.8);
    }

    .backdrop-blur-xl {
        background-color: rgba(0, 0, 0, 0.9);
    }

    .backdrop-blur-2xl {
        background-color: rgba(0, 0, 0, 0.85);
    }
}
</style>
