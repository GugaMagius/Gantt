<template>
  <div>

    <!-- Seletor de data Inicial e final -->
    <div class="p-fluid grid" style="margin-top: 2vh">
      <!-- Data inicial -->
      <div class="field col-1 md:col-1  ">
        <span class="p-float-label">
          <Calendar id="dataInicial" :inputStyle="{ 'text-align': 'center', 'font-size': '0.75vw ' }" v-model="dataInicio"
            :showTime="false" :showSeconds="true" dateFormat="dd/mm/yy" :monthNavigator="true" :yearNavigator="true"
            :showButtonBar="true" autocomplete="off" @change="dataAlterada" @date-select="dataAlterada" />
          <label for="dataInicial"> Data Inicial: </label>
        </span>
      </div>

      <!-- Data final -->
      <div class="field col-1 md:col-1">
        <span class="p-float-label">
          <Calendar id="dataFinal" :inputStyle="{ 'text-align': 'center', 'font-size': '0.75vw ' }" v-model="dataFim"
            :showTime="false" :showSeconds="true" dateFormat="dd/mm/yy" :monthNavigator="true" :yearNavigator="true"
            :showButtonBar="true" autocomplete="off" @change="dataAlterada" @date-select="dataAlterada" />
          <label for="dataFinal"> Data Final: </label>
        </span>
      </div>
    </div>

    <!-- ******************** Gráfico de Gantt *******************************-->

    <!-- Semanas -->
    <div style="width: 100%;" v-if="difDataDias > 7">
      <table class="grade" width="100%">
        <tr>
          <th class="grade" rowspan="1"></th>
          <th class="grade" v-for="semana in semanasOrdem" :key="semana" :style="{ width: `${90 / difDataDias / 16}vw` }">
            <div class="semana"> W{{ semana.split('/')[0] }} </div>
          </th>
        </tr>

        <tr v-for="cod in Object.keys(linhasComp)">
          <td class="grade" style="width: 5%;">{{ linhasComp[cod] }}</td>
          <td class="grade" style="vertical-align: top;" v-for="(semana, index) in semanasOrdem">
            <div v-if="capacidade[cod].length > 0"> {{ capacidade[cod][semana] }}kk </div>

              <InputText v-model="capacidade[cod][semana]" style="width: 100%; text-align: center;"
                @change="atualizarRegSemana([semana, capacidade[cod][semana], index, cod])" />

          </td>
        </tr>
      </table>

    </div>

  </div>
</template>
  
  
<script >
import moment from 'moment/dist/moment';
import pt from 'moment/dist/locale/pt-br'


export default {
  props: {
    inserirReg: Function,
    buscarReg: Function,
    atualizarReg: Function,
    apagarReg: Function,
  },
  computed: {
    linhasComp() {
      return this.linhas.reduce((acc, objLinha) => {

        acc[objLinha.cod] = objLinha.label

        return acc

      }, {})
    },

    semanasOrdem() {
      return Object.keys(this.semanas).sort((a, b) => {
        let semana1 = moment(a, "ww/YY")
        let semana2 = moment(b, "ww/YY")
        if (semana1 > semana2) { return 1 }
        else if (semana1 < semana2) { return -1 }
        else { return 0 }
      }
      )
    },
  },

  methods: {
    atualizarRegSemana([registro, valor, id, linha]) {
      console.log("alterado registro da semana", registro, " - com o valor: ", valor, " - para a linha: ", linha)

      this.buscarReg([{ 'semana': registro, 'linha': linha }, "Capacidade"]).then(res => {
        console.log("Resposta da consulta da semana...", res)
        if (res.data.length >= 1) {
          this.atualizarReg([{ 'semana': registro, 'valor': valor, '_id': res.data[0]['_id'], 'linha': linha }, 'Capacidade'])
        } else {
          this.inserirReg([{ 'semana': registro, 'valor': valor, 'linha': linha }, 'Capacidade'])
        }
      })

      //this.atualizarReg([])
      //this.atualizarReg([dados, 'Processos'])


    },




    // Atualiza cálculos de data 
    dataAlterada() {

      moment.locale('pt-br', pt)
      this.diasSemanas = []
      let dataInicio = moment(this.dataInicio, 'MM-DD-YYYY');
      let dataFim = moment(this.dataFim, 'DD/MM/YYYY');

      this.difDataDias = dataFim.diff(dataInicio, 'days');

      if (this.difDataDias >= 0) {
        this.semanas = {};
        this.diasSemanas = [];
        this.diasMes = [];


        for (let i = 0; i <= this.difDataDias; i++) {
          let diaLeitura = moment(this.dataInicio, 'MM-DD-YYYY').add(i, 'days')
          let ano = diaLeitura.format('YY')
          let semana = diaLeitura.format('ww')
          this.semanas[`${semana}/${ano}`] = 0
        }


        this.buscarReg([{}, "Capacidade"]).then(
          res => {
            res.data.forEach(elemento => {
              console.log("Elemento: ", elemento.semana, " - valor: ", elemento.valor)
              this.capacidade[elemento.linha] = this.capacidade[elemento.linha] || {}
              this.capacidade[elemento.linha][elemento.semana] = elemento.valor
            })
          }
        )


      }
    }

  },
  beforeMount() {

    this.dataInicio = new Date();

    this.linhas.forEach(linha => {
      this.capacidade[linha.cod] = {}
    });

    //this.atualizaListaProcessos();

  },

  data() {
    return {
      teste: '',
      linhas: [{ label: 'Linha Pesada', cod: 'pesada' }, { label: 'Linha Leve', cod: 'leve' }],
      dataInicio: '', // Data de início do Gráfico de Gantt
      dataFim: '', // Data de fim do Gráfico de Gantt
      difDataDias: 0, // Diferença de data em anos para calcular tamanho do eixo X do Gantt
      semanas: {}, //Semanas selecionadas
      diasSemanas: [], // Dias das semanas que foram selecionados
      diasMes: [], // Dias do Mes selecionados
      totalDias: 0, // Total de dias úteis da seleção
      maquinaCor: [],
      capacidade: {}, // Capacidade de máquinas por linha por semana
      cores: [
        'aqua',
        'bisque',
        'darkgray',
        'darkseagreen',
        'lightblue',
        'lightpink',
        'palegreen',
        'paleturquoise',
        'plun',
        'silver',
        'skyblue',
        'wheat'
      ],
    }
  }

}


</script>
  
<style>
.week {
  display: inline;
  height: 4vh;
  margin: 1%;
}

.grade {
  border: 1px solid black;
  border-collapse: collapse;

}

.semana {
  font-size: medium;
}

.diaMes {
  font-size: x-small;
}

.diaSem {
  font-size: x-small;
}

p {
  margin-top: 0;
  margin-bottom: 0;
}

.demanda {
  border-radius: 14%;
  border-style: hidden;
  height: 100%;

}

.maquina {
  border-radius: 5%;
  border-width: 2px;
  border-style: dotted;
  border-color: black;
  padding: 2%;
  margin: 3%;
  height: 100%;
}
</style>