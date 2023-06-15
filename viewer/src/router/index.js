import { createRouter, createWebHistory } from 'vue-router'
import GanttPlanejamento from '../views/GanttPlanejamento.vue'
import GanttFU from '../views/GanttFU.vue'
import Teste from '../views/teste.vue'
import CadProcesso from '../views/cadProcesso.vue'
import CadComercial from '../views/cadComercial.vue'
import CadCapacidade from '../views/cadCapacidade.vue'
const varTeste = "Mensagem para o servidor"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'GanttPlanejamento',
      component: GanttPlanejamento
    },
    {
      path: '/followup',
      name: 'GanttFollowUp',
      component: GanttFU
    },
    {
      path: '/teste',
      component: Teste
    },
    {
      path: '/cadprocesso',
      component: CadProcesso
    },
    {
      path: '/cadcomercial',
      component: CadComercial
    },
    {
      path: '/cadcapacidade',
      component: CadCapacidade
    }
  ]
})

export default router
