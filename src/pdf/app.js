import Vue from "vue";
import VueResource from "vue-resource"
import App from "./template/app.vue";
import html2canvas from 'html2canvas';

window.Vue = Vue;
Vue.use(VueResource);
window.html2canvas = html2canvas;

new Vue({
    render: h => h(App)
}).$mount('#pdf')