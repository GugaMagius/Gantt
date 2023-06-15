<template>
  <div>
    <!-- Seletor de data Inicial e final -->
    <div class="p-fluid grid" style="margin-top: 2.5vh">
      <!-- Data inicial -->
      <div class="field col-1 md:col-1  ">
        <span class="p-float-label">
          <Calendar id="dataInicial" :inputStyle="{ 'text-align': 'center', 'font-size': '0.75vw ' }" v-model="dataInicio"
            :showTime="false" :showSeconds="true" dateFormat="dd/mm/y" :monthNavigator="true" :yearNavigator="true"
            :showButtonBar="true" autocomplete="off" @change="dataAlterada" @date-select="dataAlterada" />
          <label for="dataInicial"> Data Inicial: </label>
        </span>
      </div>

      <!-- Data final -->
      <div class="field col-1 md:col-1">
        <span class="p-float-label">
          <Calendar id="dataFinal" :inputStyle="{ 'text-align': 'center', 'font-size': '0.75vw ' }" v-model="dataFim"
            :showTime="false" :showSeconds="true" dateFormat="dd/mm/y" :monthNavigator="true" :yearNavigator="true"
            :showButtonBar="true" autocomplete="off" @change="dataAlterada" @date-select="dataAlterada" />
          <label for="dataFinal"> Data Final: </label>
        </span>
      </div>

      <div class="p-float-label col-2 md:col-2">
        <Dropdown v-model="semanaSelecionada" inputId="selectSemana" :options="listaSemanas"
          placeholder="Selecionar a semana" class="w-full md:w-14rem" @change="atualizaDados(calculaEntregas())" />
        <label for="selectSemana">Selecionar a semana</label>
      </div>


      <div class="col-3 flex-nowrap grid">
        <div v-for="status in Object.keys(coresStatus)" class="legenda" :class="coresStatus[status]"
          @click="status === 'Faturado' ? '' : filtro[status] = !filtro[status]">
          <strong> {{ status }} </strong>

        </div>

        <!-- <Button v-for="status in Object.keys(coresStatus)" class="legenda col-1" size="small" :label="status"
          :severity="coresStatus[status]['severity']" :outlined="!filtro[status]"
          @click="status === 'Faturado' ? '' : filtro[status] = !filtro[status]" /> -->
      </div>
      <div class="col-1"></div>
      <div class="col-1">
        <Button label="Abrir" icon="pi pi-folder-open" @click="modalArquivo" />
      </div>
      <div class="col-1">
        <Button label="Salvar" icon="pi pi-save" @click="dialogSalvar = true" />
      </div>
      <div class="col-2">
        <Button label="Atualizar" icon="pi pi-refresh" @click="calculaEntregas" />
      </div>

      <Dialog v-model:visible="dialogSalvar" modal header="Salvar arquivo..." :style="{ width: '20vw' }">

        <div>
          <span class="p-float-label" :style="{ 'margin-top': '5%' }">
            <InputText id="nomeArquivo" v-model="nomeArquivo" />
            <label for="nomeArquivo">Nome do Arquivo: </label>
          </span>
        </div>

        <template #footer>
          <Button label="Cancelar" icon="pi pi-times" @click="dialogSalvar = false" text />
          <Button label="Salvar" icon="pi pi-save" @click="salvar" autofocus />
        </template>
      </Dialog>


      <Dialog v-model:visible="dialogAbrir" modal header="Salvar arquivo..." :style="{ width: '70vw' }">

        <div>

          <DataTable :value="listaArquivos" v-model:selection="arquivoSelecionado" selectionMode="single"
            metaKeySelection="true" dataKey="_id" scrollable scrollHeight="400px"  sortField="dataHora" :sortOrder="-1"  sortMode="multiple" stripedRows
            tableStyle="min-width: 40rem" @dblclick="abrirArquivo">
            <Column field="nome" header="Nome do Arquivo"></Column>
            <Column field="semanaSelecionada" style="min-width:5%" header="Semana de Início"></Column>
            <!-- <Column field="_id" header="ID">
            </Column> -->
            <Column field="dataHora" sortable header="Dara/Hora">
              <template #body="{ data, field }">
                {{ converteData(data[field]) }}
              </template>
            </Column>
          </DataTable>

        </div>
        <template #footer>
          <Button label="Cancelar" icon="pi pi-times" @click="dialogAbrir = false" text />
          <Button label="Abrir" icon="pi pi-folder-open" @click="abrirArquivo" autofocus />
        </template>
      </Dialog>

    </div>


    <!-- ******************** Gráfico de Gantt *******************************-->

    <!-- Semanas -->
    <div class="divGantt" style="width: 100%; margin-bottom: 8vh;" v-if="difDataDias > 7">
      <ScrollPanel class="scrollGantt" style="width: 98vw; height: 75vh; margin=2%; margin-bottom: 8vh; "
        v-if="difDataDias > 7">
        <table class="grade" width="100%">
          <tr>
            <th class="grade" rowspan="3"></th>
            <th class="grade" v-for="(colspan, semana) in semanas" :key="semana" :colspan=colspan
              :style="{ width: `${90 / difDataDias / 7}vw` }">
              <div class="semana"> W{{ semana.split('/')[0] }} </div>
            </th>
          </tr>
          <tr>
            <td class="grade" v-for="(dia, index) in diasSemanas">
              <div class="diaSem"> {{ dia }}</div>
            </td>
          </tr>

          <tr>
            <td class="grade" v-for="dia in diasMes">
              <div class="diaMes">
                <p><u> {{ dia.split('/')[0] }} </u></p>
                <p margin='0px' padding="0px">{{ dia.split('/')[1] }} </p>
              </div>
            </td>
          </tr>

          <tr v-for="linha in linhas" :key="linha">
            <td class="grade" style="width: 5%;">{{ linha.label }}</td>
            <td class="grade" style="vertical-align: top;" v-for="(colspan, semana) in semanas" :colspan=colspan>
              <div style="height: 100%; width: 100%">
                <div class="maquina" style="text-align: center; height: 4vh; " width="100%"
                  v-for="qtd in parseInt(capacidadeCompilada[linha.cod][semana])">

                  <div
                    v-if="(semana in demanda[linha.cod]) ? demanda[linha.cod][semana].length >= qtd && demandaPronta : false"
                    class="maquinaPlan" :class="maquinaCor[demanda[linha.cod][semana][qtd - 1]]">

                    {{ demanda[linha.cod][semana] ? demanda[linha.cod][semana][qtd - 1] : '' }}

                  </div>
                  <!-- <div class="demanda" :style="{
                  'background-color': maquinaCor[demanda[linha.cod][semana][qtd - 1]]['fundo'],
                  'color': maquinaCor[demanda[linha.cod][semana][qtd - 1]]['fonte']
                }" -->

                  <!-- <div class="demanda" :class="maquinaCor[demanda[linha.cod][semana][qtd - 1]]"
                  v-if="(semana in demanda[linha.cod]) ? demanda[linha.cod][semana].length >= qtd && demandaPronta : false">
                  <strong>{{ demanda[linha.cod][semana] ? demanda[linha.cod][semana][qtd - 1] : '' }}</strong>
                </div> -->
                </div>

              </div>

            </td>
          </tr>
        </table>
      </ScrollPanel>

    </div>

  </div>
</template>
  
  
<script >
import moment from 'moment/dist/moment';
import pt from 'moment/dist/locale/pt-br'


export default {

  props: {
    buscarReg: Function,
    inserirReg: Function,
  },

  methods: {
    // Lista máquinas para atribuir cor no Gantt 57763105895
    modalArquivo() {
      this.buscarReg([{}, 'GanttComercial']).then(res => {

        this.listaArquivos = res.data

      })

      return this.dialogAbrir = true;
    },
    converteData(dataString) {
      return moment(dataString).format("DD/MM/YYYY HH:MM:SS")
    },

    abrirArquivo() {
      this.dialogAbrir = false;

      this.filtro.Faturado = true; // Ativa filtro para abrir arquivo pois pode haver demanda salva anteriormente

      this.semanaSelecionada = this.arquivoSelecionado.semanaSelecionada;

      this.semanas = this.arquivoSelecionado.semanas

      this.dataInicio = new Date(Date.parse(this.arquivoSelecionado.dataInicio))

      this.dataFim = new Date(Date.parse(this.arquivoSelecionado.dataFim))

      this.difDataDias = this.arquivoSelecionado.difDataDias

      this.filtro = this.arquivoSelecionado.filtro

      this.linhas = this.arquivoSelecionado.linhas

      this.demanda = this.arquivoSelecionado.demanda

      this.capacidade = this.arquivoSelecionado.capacidade

      this.vCorMaquina();

      this.demandaPronta = true

    },

    salvar() {

      if (this.demanda != {} && this.semanaSelecionada != '' && this.nomeArquivo != '') {

        let arquivo = {}

        arquivo['nome'] = this.nomeArquivo;
        arquivo['semanaSelecionada'] = this.semanaSelecionada;
        arquivo['semanas'] = this.semanas
        arquivo['dataInicio'] = this.dataInicio
        arquivo['dataFim'] = this.dataFim
        arquivo['difDataDias'] = this.difDataDias
        arquivo['filtro'] = this.filtro
        arquivo['linhas'] = this.linhas
        arquivo['capacidade'] = this.capacidade;
        arquivo['demanda'] = this.demanda;
        arquivo['dataHora'] = new Date();

        this.buscarReg([{ nome: this.nomeArquivo }, "GanttComercial"]).then(res => {
          if (res.data.length >= 1) {
            alert("Arquivo já existente, será substituído");
            arquivo['_id'] = res.data[0]['_id'];
            this.atualizarReg([arquivo, 'GanttComercial']);
          } else {
            this.inserirReg([arquivo, 'GanttComercial']);
          }
        })

        this.nomeArquivo = '';
        this.dialogSalvar = false;

      } else {

        alert("Não existem dados suficientes para salvar!!! ")
      }

      this.inserirReg([arquivo, 'GanttComercial']);
    },

    vCorMaquina() {

      this.cadastroMaq.forEach(maquinaVendida => {
        this.maquinaCor = this.maquinaCor || {}
        this.maquinaCor[maquinaVendida.maquina] = this.coresStatus[maquinaVendida.statusVenda]
      }
      )

    },

    calculaEntregas() {


      this.filtro['Faturado'] = false;
      let maquinasVendidas = [...this.cadastroMaq]
      this.demanda = {}
      let ultimaSemana = moment().format("ww/YY")
      Object.keys(this.capacidade).forEach(linha => {
        Object.keys(this.capacidade[linha]).forEach(semana => {
          let diaSemana = moment(semana, "ww/YY").startOf('isoWeek').format("DD/MM/YYYY")

          // Compara se a semana atual é maior ou igual a semana selecionada para então distribuir as cargas de máquinas
          if (moment(semana, "ww/YY").isSameOrAfter(moment(this.semanaSelecionada.split('W')[1], "ww/YY"))) {
            [...maquinasVendidas].forEach(maquina => {
              //console.log("Máquina:", maquina.maquina)
              if (maquina.linha.cod === linha) {
                this.demanda = this.demanda || {}
                this.demanda[linha] = this.demanda[linha] || {}
                this.demanda[linha][semana] = this.demanda[linha][semana] || []
                if (this.demanda[linha][semana].length < this.capacidade[linha][semana]
                  &&
                  this.filtro[maquina.statusVenda] === true) {
                  this.demanda[linha][semana].push(maquina.maquina)
                  maquinasVendidas.splice(maquinasVendidas.indexOf(maquina), 1)
                  ultimaSemana = semana

                }

              }

            })

          }

        })

      })


      return (
        this.demandaPronta = true,
        console.log("Primeira semana: ", new Date(Date.parse(moment(this.semanaSelecionada, "ww/YY").subtract(1, 'week').format("MM-DD-YYYY")))),
        this.dataInicio = new Date(Date.parse(moment(this.semanaSelecionada, "ww/YY").subtract(1, 'week').format("MM-DD-YYYY"))),
        this.dataFim = new Date(Date.parse(moment(ultimaSemana, "ww/YY").add(2, 'week').format("MM-DD-YYYY"))), this.dataAlterada()
      )

    },

    // Atualiza cálculos de data 
    dataAlterada() {
      console.log("Solicitado atualização")
      this.vCorMaquina();

      moment.locale('pt-br', pt)
      this.diasSemanas = []
      let dataInicio = moment(this.dataInicio, 'DD/MM/YYYY');
      let dataFim = moment(this.dataFim, 'DD/MM/YYYY');

      this.difDataDias = dataFim.diff(dataInicio, 'days');

      if (this.difDataDias >= 0) {
        this.semanas = {};
        this.diasSemanas = [];
        this.diasMes = [];

        for (let i = 0; i <= this.difDataDias; i++) {
          let diaLeitura = moment(this.dataInicio, 'dd/mm/yy').add(i, 'days')
          let diaSemTexto = diaLeitura.format('ddd')
          let semana = diaLeitura.format('ww/YY')


          this.diasMes.push(diaLeitura.format('DD/MM'))

          //this.diasMes.push(semana)

          if (this.semanas[semana] == undefined) {
            this.semanas[semana] = 1
          } else if (this.semanas[semana] < 7) { //#Verificar, colocar valor 5 para não mostrar sábado e domingo
            this.semanas[semana] = this.semanas[semana] + 1
          }


          this.diasSemanas.push(diaSemTexto)

        }

      }

    },

    atualizaDados(callback) {

      this.buscarReg([{}, 'Capacidade']).then(
        res => {

          let semanasOrdenadas = res.data.sort((a, b) => {
            let data1 = moment(a.semana, "ww/YY").format("X")
            let data2 = moment(b.semana, "ww/YY").format("X")
            if (data1 > data2) { return 1 }
            else if (data2 > data1) { return -1 }
            else { return 0 }
          })


          return this.capacidade = semanasOrdenadas.reduce((acc, elemento) => {
            acc[elemento.linha] = acc[elemento.linha] || {}
            acc[elemento.linha][elemento.semana] = elemento.valor
            return acc
          }, {})

        }

      )

      // Atualiza registros de vendas e calcula tempo para execução
      this.buscarReg([{}, 'Vendas']).then(
        res => {

          this.cadastroMaq = res.data.sort((a, b) => { if (parseInt(a.seq) < parseInt(b.seq)) { return -1; } else { return true; } })

        }

      )


      let semanaAtual = moment().subtract(3, 'week').week()
      console.log("Semana atual: ", semanaAtual)
      for (let s = 0; s < 53; s++) {
        this.listaSemanas.push(`W${moment().add(s - 3, 'week').format("ww/YY")}`)
      }

      return callback;
    }




  },
  computed: {
    capacidadeCompilada() {
      return Object.keys(this.capacidade).reduce((acc, linha) => {
        Object.keys(this.semanas).forEach(semana => {
          acc[linha] = acc[linha] || {}
          acc[linha][semana] = this.capacidade[linha][semana] || 0
        })
        return acc
      }, {})
    }

  },
  mounted() {

    this.dataInicio = new Date();

    this.atualizaDados();



  },

  data() {
    return {
      dialogSalvar: false, // Dialog modal para salvar planejamento
      dialogAbrir: false, // Dialog modal para abrir planejamento já salvo
      listaArquivos: [], // Lista de arquivos salvos
      arquivoSelecionado: [], // Arquivo selecionado na DataTable
      nomeArquivo: '', // Nome do arquivo para salvar planejamento
      cadastroMaq: [], // Cadastro de máquinas vendidas
      listaSemanas: [], // Lista de semanas do ano
      semanaSelecionada: [], // Semana selecionada para inicio da programação do Gantt
      linhas: [{ label: 'Linha Pesada', cod: 'pesada' }, { label: 'Linha Leve', cod: 'leve' }],
      dataInicio: '', // Data de início do Gráfico de Gantt
      dataFim: '', // Data de fim do Gráfico de Gantt
      difDataDias: 0, // Diferença de data em anos para calcular tamanho do eixo X do Gantt
      semanas: {}, //Semanas selecionadas
      diasSemanas: [], // Dias das semanas que foram selecionados
      diasMes: [], // Dias do Mes selecionados
      totalDias: 0, // Total de dias úteis da seleção
      maquinaCor: {}, // Lista de máquinas por cor
      capacidade: {}, // Lista de capacidade de produção por semana
      demanda: {}, // Arquivo de organização da demanda por linha e por semana
      demandaPronta: false, // Flag que sinaliza que a demanda está pronta para ser lida
      filtro: { // Filtros para seleção de quais maquinas deverão serem programadas
        Pedido: true,
        Forecast: true,
        Faturado: false
      },
      coresStatus: {
        Pedido: 'pedido',
        Forecast: 'forecast',
        Faturado: 'faturado'
      }


    }
  }

}


</script>
  
<style scoped>
.divGantt {
  display: flex;
  justify-content: center;
  align-items: center;
}

::v-deep(.p-scrollpanel.scrollGantt .p-scrollpanel-wrapper) {
  border-right: 10px solid var(--surface-ground);
}

::v-deep(.p-scrollpanel.scrollGantt .p-scrollpanel-bar) {
  background-color: var(--primary-300);
  opacity: 1;
  transition: background-color 0.3s;
}

::v-deep(.p-scrollpanel.scrollGantt .p-scrollpanel-bar:hover) {
  background-color: var(--primary-400);
}

.maquinaPlan {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Alinha horizontalmente ao centro */

}

.faturado {
  background-color: lawngreen;
  color: white;
}

.forecast {
  background-color: orange;
  color: white;
}

.pedido {
  background-color: lightblue;
  color: white;
}

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
  margin-top: 0px;
  margin-bottom: 0px;

}

.legenda {
  display: flex;
  align-items: center;
  justify-content: center;
  /* Alinha horizontalmente ao centro */
  border-radius: 10%;
  border-style: solid;
  height: 50%;
  width: 100%;
  margin: 1%;

}

.maquina {
  border-radius: 5%;
  border-width: 2px;
  border-style: dotted;
  border-color: black;
  padding: 0%;
  margin: 3%;
  height: 100%;
}
</style>