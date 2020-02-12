import Vue from "vue";
import VueResource from "vue-resource"
import App from "./template/app.vue";
import html2canvas from 'html2canvas';
import Vue2Filters from 'vue2-filters';
import _ from 'lodash';

window.Vue = Vue;
Vue.use(VueResource);
Vue.use(Vue2Filters);
Vue.use(_);
window.html2canvas = html2canvas;

new Vue({
    render: h => h(App)
}).$mount('#pdf')