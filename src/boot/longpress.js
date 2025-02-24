// Language: JavaScript
import { createApp } from 'vue'
import App from 'src/App.vue' // adjust the path if needed
import longpressDirective from 'src/directives/longpressDirective' // place your directive code here

const app = createApp(App)
app.directive('longpress', longpressDirective)
app.mount('#q-app')