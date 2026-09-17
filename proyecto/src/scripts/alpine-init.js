import Alpine from 'alpinejs';
import { registerComponents } from './alpine-components.js';

registerComponents(Alpine);
window.Alpine = Alpine;
Alpine.start();
