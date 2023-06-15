
<template>
  <div class="Principal">

    <!-- FAIXA DE TÍTULO (FIXA )-->
    <div class="Titulo">
      <div class="logo">

        <img src="../public/logoMagius.png" style="width: auto; height: auto; max-width: 150px; max-height: 150px;" />
        <div style="margin-top: 0; font-size: x-small;">Gestão de Dados da Manufatura</div>

      </div>

      <h2>Planejamento Produção {{ $route.name != undefined ? $router.name : '' }} </h2>
      

      <div class="botaoinicio">
        <Button type="button" icon="pi pi-bars" class="p-button-sm" @click="toggle" aria-haspopup="true"
          aria-controls="overlay_menu" />
        <Menu id="overlay_menu" ref="menu" :model="items" :popup="true" />
      </div>
    </div>

    <!-- <li v-for="etapa in calcDadosGantt">{{ etapa }}</li> -->

    <!-- CORPO DA PÁGINA -->
    <div class="RouterView">
      <router-view :inserirReg="inserirDB" :buscarReg="buscarDB" :apagarReg="apagarDB" :atualizarReg="atualizarDB"
        :compDemanda="dadosGantt" :demanda1="calcDadosGantt" />
    </div>


  </div>
</template>

<script>
import { RouterView } from 'vue-router' //import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'
import axios from 'axios'


// const endereco= 'localhost' //100.69.0.6 //10.41.1.115
const endereco= '10.69.0.6' //10.69.0.6 //10.41.1.115

export default {
  data() {
    return {
      calcDadosGantt: [],
      testeDemanda: {},
    }
  },
  mounted() {

    // this.apagarDB([{_id: 'oxqSBZ5AyGaSUIj4'},'GanttComercial'])
    //this.apagarDB([{}, 'Apontamento'])
    // this.buscarDB([{},'Apontamento']).then(res=>{
    //   console.log(res.data)
      //  this.apagar.forEach(apontamento=>this.apagarDB([{_id: 'zcX7yS58yOJXtmFn'},'GanttComercial']))
    // })

    // inserir.forEach(planejamento=>this.inserirDB([planejamento, "GanttComercial"]))


  },
  methods: {
    dadosGantt(dados) {

      this.testeDemanda = dados
      Object.keys(dados).forEach(processo => {
        dados[processo].forEach((carga, index) => {
          dados[processo][index].forEach(fase => {
            this.calcDadosGantt.push({
              fase: processo,
              maquina: fase.maquina,
              start: fase.start,
              leadtime: fase.leadtime
            })
          })

        })

      })
    },
    inserirDB(dados) {
      console.log("Solicitado inseração de dados para os dados: ", dados)
      axios
        .post(`http://${endereco}:3008/inserir`, dados).then(
          res => console.log("Resposta da promise: ", res)

        )
        .catch(err => console.log(err))
    },

    apagarDB(dados) {
      axios
        .post(`http://${endereco}:3008/apagar`, dados).then(
          res => console.log("Resposta da promise para apagar registro: ", res)
        )
        .catch(err => console.log(err))
    },

    buscarDB(parametro) {
      return new Promise(
        (resolve, reject) => {
          axios
            .post(`http://${endereco}:3008/buscar`, parametro).then(
              res => {
                resolve(res)
              }
            )
            .catch(err => reject(err))
        }

      )

    },

    atualizarDB(dados) {
      axios
        .post(`http://${endereco}:3008/atualizar`, dados).then(
          res => res
        )
        .catch(err => console.log(err))
    }

  },
  setup() {

    // Configuração do MENU
    const menu = ref();

    const items = ref([
      {
        label: "Gantt de Planejamento",
        to: "/",
      },
      {
        label: "Gantt Follow-up",
        to: "/followup",
      },
      {
        label: "Cadastro Comercial",
        to: "/cadcomercial",
      },
      {
        label: "Cadastro Processos",
        to: "/cadprocesso",
      },
      {
        label: "Cadastro Capacidade",
        to: "/cadcapacidade",
      }
    ]);

    const toggle = (event) => {
      menu.value.toggle(event);
    };
    return { menu, items, toggle }
  }

}


</script>


<style>
.logo {
  position: absolute;
  left: 0;
  z-index: 10;
  margin-top: auto;
  margin-bottom: auto;
  padding-top: 0;
  padding-bottom: 0;
}

.RouterView {
  overflow-y: auto;
  height: 100%;
  z-index: 0;
}

.botaoinicio {
  position: absolute;
  right: 0;
  margin-top: auto;
  margin-bottom: auto;
  padding-right: 5%;
  z-index: 10;
}

.Principal {
  height: 100vh;
  width: 100vw;
  padding-left: 0px;
  padding-right: 0px;
  margin-left: 0px;
  margin: 0px;
}


.Titulo {
  height: 7vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--surface-d);
  padding-top: auto;
  padding-bottom: auto;
  margin-bottom: 0px;
  margin-top: 0px;
  z-index: 10;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  /*color: #2c3e50;*/
  margin-left: 0px;
  margin: 0px;
  padding: 0px;
  height: 100%;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
}
</style>
