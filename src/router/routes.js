const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/QRcodeScanner.vue') },
      { path: 'qr-code-scanner', component: () => import('pages/QRcodeScanner.vue') },
      { path: 'save-qr-codes', component: () => import('pages/SaveQRcodes.vue') },
      { path: 'qr-generator', component: () => import('pages/QRGenerator.vue') }
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
