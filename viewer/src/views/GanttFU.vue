<template>
  <div>
    <!-- Seletor de data Inicial e final -->
    <div class="p-fluid grid" style="margin-top: 2vh">
      <!-- Data inicial -->
      <!-- <div class="field col-1 md:col-1 ">
        <span class="p-float-label">
          <Calendar id="dataInicial" :inputStyle="{ 'text-align': 'center', height: '5vh','font-size': '0.7rem ' }" v-model="dataInicio"
            :showTime="false" :showSeconds="true" dateFormat="dd/mm/yy" :monthNavigator="true" :yearNavigator="true"
            :showButtonBar="true" autocomplete="off" @change="dataAlterada" @date-select="dataAlterada" />
          <label for="dataInicial"> Início Gantt: </label>
        </span>
      </div> -->

      <!-- Data final -->
      <!-- <div class="field col-1 md:col-1">
        <span class="p-float-label">
          <Calendar id="dataFinal" :inputStyle="{ 'text-align': 'center', height: '5vh', 'font-size': '0.7rem ' }" v-model="dataFim"
            :showTime="false" :showSeconds="true" dateFormat="dd/mm/yy" :monthNavigator="true" :yearNavigator="true"
            :showButtonBar="true" autocomplete="off" @change="dataAlterada" @date-select="dataAlterada" />
          <label for="dataFinal"> Fim gantt: </label>
        </span>
      </div> -->


      <div class="col-1"></div>
      <!-- Caixa de diálogo para selecionar o arquivo de demanda do cliente -->
      <div class="col-1">
        <Button label="Abrir" icon="pi pi-folder-open" @click="modalArquivo"
          :style="{ fontSize: '1rem', padding: '0.5rem 1rem' }" />
      </div>

      <Dialog v-model:visible="dialogAbrir" modal header="Salvar arquivo..." :style="{ width: '60vw' }">

        <div>

          <DataTable :value="listaArquivos" v-model:selection="arquivoSelecionado" selectionMode="single"
            metaKeySelection="true" dataKey="_id" sortField="dataHora" :sortOrder="-1" scrollable scrollHeight="400px"
            stripedRows tableStyle="min-width: 50rem" @dblclick="abrirArquivo">
            <Column field="nome" sortable header="Nome do Arquivo"></Column>
            <Column field="semanaSelecionada" style="min-width:5%" header="Semana de Início"></Column>
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

      <!-- Legenda e filtros -->
      <div class="col-5">
        <table>
          <tr>
            <td class="legenda">
              <h4> </h4>
            </td>



            <!-- 
              
      /*      
            status: 1 // 0 = Normal, 1 = Em andamento, 2 = Concluído, 3 = Atrasado, 4 = Faturado, 5 = Forecast Atrasado
       
        */
             -->
            <td class="statusNormal legenda">
              <Badge class="badge" v-if="qtdStatus['0']" :value="qtdStatus['0']" @click="filtroStatus = 0"></Badge>
              No prazo
            </td>
            <td class="statusEmAndamento legenda">
              <Badge class="badge" v-if="qtdStatus['1']" :value="qtdStatus['1']" @click="filtroStatus = 1"></Badge>
              Em andamento
            </td>
            <td class="statusConcluido legenda">
              <Badge class="badge" v-if="qtdStatus['2']" :value="qtdStatus['2']" @click="filtroStatus = 2"></Badge>
              Concluído
            </td>
            <td class="statusAtrasado legenda">
              <Badge class="badge" v-if="qtdStatus['3']" :value="qtdStatus['3']" @click="filtroStatus = 3"></Badge>
              Atrasado
            </td>
            <td class="statusFaturado legenda">
              <Badge class="badge" v-if="qtdStatus['4']" :value="qtdStatus['4']" @click="filtroStatus = 4"></Badge>
              <div class="legenda">Faturado</div>
            </td>
            <td class="statusNaoAplica legenda">
              <Badge class="badge" v-if="qtdStatus['6']" :value="qtdStatus['6']" @click="filtroStatus = 6"></Badge>
              <div class="legenda">Não se <br> Aplica</div>
            </td>
            <td class="statusFerecastAtrasado legenda">
              <Badge class="badge" v-if="qtdStatus['5']" :value="qtdStatus['5']" @click="filtroStatus = 5"></Badge>
              Forecast > 15 sem.
            </td>
            <td class="legBloqueio legenda">
              <Badge class="badge" v-if="qtdBloqueio > 0" :value="qtdBloqueio" @click="filtroStatus = 7"></Badge>
              Bloqueio
              <Badge class="badgeBloqueio" value="!"></Badge>
            </td>
          </tr>
        </table>
      </div>

      <!-- Seletor de filtros Setor / Fase do processo -->
      <div class="col-3" style="display: flex; margin-left: 2%;">


        <div class="p-float-label" style="margin-right: 1rem;">
          <Dropdown v-model="filtroMaquina" inputId="ddMaquina" :options="maquinaCor" placeholder="Selecione a Maquina"
            :style="{ fontSize: '1rem', width: '8vw', height: '5vh', padding: '0.1rem 0.1rem' }" />
          <label for="ddMaquina">Máquina</label>
        </div>

        <div class="p-float-label" style="margin-right: 1rem;">
          <Dropdown v-model="filtroSetor" inputId="ddSetor" :options="Object.keys(listaSetor)"
            placeholder="Selecione o Setor"
            :style="{ fontSize: '1rem', width: '10vw', height: '5vh', padding: '0.1rem 0.1rem' }" />
          <label for="ddSetor">Setor</label>

        </div>

        <div class="p-float-label">
          <Dropdown v-model="filtroFase" inputId="ddFase"
            :options="filtroSetor === '' ? Object.keys(listaFase) : Object.keys(listaSetor[filtroSetor])"
            placeholder="Selecione a Fase"
            :style="{ fontSize: '1rem', width: '8vw', height: '5vh', padding: '0.1rem 0.1rem' }" />
          <label for="ddFase">Fase</label>
        </div>

        <div class="field" style="margin-left: 1%;">
          <Button icon="pi pi-replay" title="Limpar Filtros" :style="{ fontSize: '1rem', padding: '0.3rem 0.3rem' }"
            @click="limparFiltros" />
        </div>
      </div>

    </div>
    <!-- {{ Object.keys(listaFase) }} / {{ Object.keys(listaSetor) }} -->

    <!-- ******************** Gráfico de Gantt *******************************-->

    <!-- Semanas -->
    <div class="divGantt">
      <ScrollPanel class="scrollGantt" style="width: 98vw; height: 75vh; margin=2%; margin-bottom: 8vh; "
        v-if="difDataDias > 7">
        <table class="grade" width="100%">
          <thead>
            <tr>
              <td rowspan="3" class="fixed-column"></td>
              <td class="grade" v-for="(colspan, semana) in semanas" :key="semana" :colspan=colspan
                :style="{ width: `${80 / difDataDias / 7}vw` }">
                <div class="semana"> W{{ semana }} </div>
              </td>
            </tr>
            <tr>
              <td class="grade" v-for="(dia, index) in diasSemanas">
                <div class="diaSem" :style="{
                  'background-color': dataHoje == diasMes[index] ? 'rgba(243, 113, 113, 0.3)' : ''
                }">
                  {{ dia }}
                </div>
              </td>
            </tr>
            <tr>
              <td class="grade" v-for="dia in diasMes">
                <div class="diaMes" :style="{
                  'background-color': dataHoje == dia ? 'rgba(243, 113, 113, 0.3)' : ''
                }">
                  <p><u> {{ dia.split('/')[0] }} </u></p>
                  <p margin='0px' padding="0px">{{ dia.split('/')[1] }} </p>
                </div>
              </td>
            </tr>
          </thead>


          <!-- Grafico de Gantt dos processos -->
          <tr v-for="(processo, index) in demandaFiltrada" :key="processo"
            :style="{ 'background-color': listra(processo.fase) }">
            <!-- <td class="grade fixed-column" style="width: 10%;" :rowspan="filtraRowspan(processo.fase)"
            v-if="fasesFiltradas[processo.fase]" :style="{ 'background-color': listra(processo.fase) }"> -->
            <td class="grade fixed-column fases" style="width: 15%;" :rowspan="fasesFiltradas[processo.fase]['rowspan']"
              v-if="fasesFiltradas['fases'][index]" :style="{ 'background-color': listra(processo.fase) }">
              <span> {{ processo.fase }} </span>
            </td>
            <td class="gradeGantt" v-for="(colspan, dia) in atualizaGantt(processo, teste)"
              :colspan="colspan >= 1 ? colspan : 1" :style="{
                'background-color': dataHoje == dia && colspan <= 1 ? 'rgba(243, 113, 113, 0.3)' : (colspan > 50 ? cores[maquinaCor.indexOf(processo.maquina)] : '')
              }
                ">

              <div :class="listaClasseStatus[verifConcluido(processo.maquina, processo.sequenciaFase)]"
                v-if="colspan >= 1 && statusMaqProc[processo.maquina]" @click="modalApontamento(processo)"
                v-on:click.ctrl="pressionadoControl(processo.maquina)">
                <div
                  :style="{ 'font-size': ajustaTexto(colspan), 'position': 'relative', 'height': 'auto', 'white-space': 'nowrap', 'hyphens': 'none' }">
                  {{ colspan >= 1 ?
                    `${processo.maquina}` : '' }}

                  <Badge v-if="statusMaqProc[processo.maquina][processo.sequenciaFase]['apontamento'] === 'BQ'"
                    class="badgeBloqueio" value="!"></Badge>

                </div>

              </div>

            </td>
          </tr>

        </table>


        <Dialog v-model:visible="dialogApontamento" modal :header="'Apontamento da Fase: ' + processoApontamento.fase"
          :style="{ width: '70vw' }">

          <div>
            <!-- <div class="flex justify-content-center align-items-center mb-4 gap-2">
            <InputSwitch v-model="apontamentoOK" inputId="inputApontamento"
              @change="atualizaStatus(processoApontamento, true)" />
            <label for="inputApontamento">Concluido</label>
          </div> -->
            <!-- Seletor de STATUS da fase e máquina atual -->
            <div class="flex flex-wrap gap-3">
              <div class="flex align-items-center">
                <RadioButton v-model="processoApontamento['apontamento']" inputId="NI" name="status" value="NI"
                  @change="atualizaStatus(processoApontamento, true)" />
                <label for="NI" class="ml-2">Não Iniciada</label>
              </div>
              <div class="flex align-items-center">
                <RadioButton v-model="processoApontamento['apontamento']" inputId="NA" name="status" value="NA"
                  @change="atualizaStatus(processoApontamento, true)" />
                <label for="NA" class="ml-2">Não se Aplica</label>
              </div>
              <div class="flex align-items-center">
                <RadioButton v-model="processoApontamento['apontamento']" inputId="EA" name="status" value="EA"
                  @change="atualizaStatus(processoApontamento, true)" />
                <label for="EA" class="ml-2">Em Andamento</label>
              </div>
              <div class="flex align-items-center">
                <RadioButton v-model="processoApontamento['apontamento']" inputId="BQ" name="status" value="BQ"
                  @change="atualizaStatus(processoApontamento, true)" />
                <label for="BQ" class="ml-2">Bloqueio</label>
              </div>
              <div class="flex align-items-center">
                <RadioButton v-model="processoApontamento['apontamento']" inputId="OK" name="status" value="OK"
                  @change="atualizaStatus(processoApontamento, true)" />
                <label for="OK" class="ml-2">Concluída</label>
              </div>
            </div>

            <div style="margin-top: 3vh; margin-bottom: 3vh; font-weight: bold;" v-if="processoApontamento['apontamento']"> Último apontamento: {{ fDataHora(processoApontamento['dataHora']) }}</div>
           

            <DataTable :value="[processoApontamento]" tableStyle="min-width: 100%">
              <Column field="maquina" header="Máquina"></Column>
              <Column field="fase" header="Fase do processo"></Column>
              <Column field="start" header="Data de Início"></Column>
              <Column field="end" header="Data de Término"></Column>
              <!-- <Column field="_id" header="ID"></Column> -->
            </DataTable>
            <span class="p-float-label textoBloqueio" v-if="processoApontamento.apontamento === 'BQ'">
              <Textarea v-model="processoApontamento['texto']" autoResize rows="3" cols="100" />
              <label>Texto referente ao Bloqueio: </label>
            </span>

          </div>
          <template #footer>
            <Button label="Cancelar" icon="pi pi-times" @click="dialogApontamento = false" text />
            <Button label="Confirmar" icon="pi pi-check" @click="confirmaApontamento" autofocus />
          </template>
        </Dialog>


      </ScrollPanel>
    </div>

  </div>
</template>
  
  
<script >
import moment from 'moment/dist/moment';
import pt from 'moment/dist/locale/pt-br';

function calcMachine(tasksRec0, maquinaRec, endDateRec, statusMaqProcRec0) {
  let statusMaqProcRec = { ...statusMaqProcRec0 }
  let tasksRec = { ...tasksRec0 }


  function findEndTasks() {
    let nopredecessor = []
    tasksRec[maquinaRec].forEach((task, index) => {
      predecessorList.geral.indexOf(task.seq) < 0 ? nopredecessor.push(index) : ''

    })

    return letEndProjectDate(nopredecessor);

  }


  function verifPredecessor(codTask) {

    if (tasksRec[maquinaRec][codTask]['predecessor']) {

      tasksRec[maquinaRec][codTask]['predecessor'].split(',').forEach(predecessor1 => {
        let predecessor = parseInt(predecessor1 - 1)
        let etapa = tasksRec[maquinaRec][predecessor]


        if (statusMaqProcRec[maquinaRec]) {

          if (statusMaqProcRec[maquinaRec][etapa['seq']]?.apontamento === 'NA') {

            etapa['endX'] = endDateRec

          }
        }

        // if (etapa['predecessor']) {
        if (etapa['endX'] === undefined || etapa['endX'] > tasksRec[maquinaRec][codTask]['startX']) {

          etapa['endX'] = tasksRec[maquinaRec][codTask]['startX']


          let dataStart = moment(etapa['endX'], 'X').subtract(tasksRec[maquinaRec][predecessor]['leadtime'], 'd').format('X')

          let difEndStart = moment(etapa['endX'], 'X').diff(moment(dataStart, 'X'), 'd')

          let diaSemanaStart = moment(dataStart, 'X').weekday();

          let diaSemanaEnd = moment(etapa['endX'], 'X').weekday();

          let qtdDomingos = 0

          if (difEndStart >= 7) {

            qtdDomingos = Math.floor(difEndStart / 7)

          }
          if (diaSemanaEnd < diaSemanaStart || diaSemanaStart === 0) {

            qtdDomingos++

          }


          etapa['startX'] = etapa['endX']
          if (statusMaqProcRec[maquinaRec]) {
            if (statusMaqProcRec[maquinaRec][etapa['seq']]?.apontamento !== 'NA') {
              etapa['startX'] = moment(dataStart, 'X').subtract(parseInt(qtdDomingos) + parseInt(etapa['deslocamento']), 'd').format('X')
            }
          }
          etapa['end'] = moment(etapa['endX'], 'X').format("DD/MM/YYYY")
          etapa['start'] = moment(etapa['startX'], 'X').format("DD/MM/YYYY")
          etapa['maquina'] = maquinaRec
          etapa['leadtimeCalc'] = parseInt(etapa['leadtime']) + parseInt(qtdDomingos) + parseInt(etapa['deslocamento'])

          if (statusMaqProcRec[maquinaRec]) {
            if (statusMaqProcRec[maquinaRec][etapa['seq']]?.apontamento === 'NA') {
              etapa['leadtimeCalc'] = 1
            }
          }

          etapa['fase'] = etapa['nome']
          etapa['sequenciaFase'] = etapa['seq']
          etapa['faseSequencia'] = (etapa['seq'] * 1000) + (etapa['nome'].charCodeAt(0) + etapa['nome'].length)

          if (parseInt(etapa['predecessor']) >= 0) {

            verifPredecessor(predecessor);

          }

        }

      })

    }
    return

  }



  function letEndProjectDate(endTasks) {
    return endTasks.forEach(endTask => {
      let etapa = tasksRec[maquinaRec][endTask]
      etapa['endX'] = endDateRec

      let dataStart = moment(etapa['endX'], 'X').subtract(etapa['leadtime'], 'd').format('X')

      let difEndStart = moment(etapa['endX'], 'X').diff(moment(dataStart, 'X'), 'd')


      let diaSemanaStart = moment(dataStart, 'X').weekday();

      let diaSemanaEnd = moment(etapa['endX'], 'X').weekday();

      let qtdDomingos = 0

      if (difEndStart >= 7) {
        qtdDomingos = Math.floor(difEndStart / 7)

      } else if (diaSemanaEnd < diaSemanaStart) {

        qtdDomingos = 1

      }

      etapa['startX'] = moment(dataStart, 'X').subtract(qtdDomingos + parseInt(etapa['deslocamento']), 'd').format('X')
      etapa['end'] = moment(etapa['endX'], 'X').format("DD/MM/YYYY")
      etapa['start'] = moment(etapa['startX'], 'X').format("DD/MM/YYYY")
      etapa['maquina'] = maquinaRec
      etapa['leadtimeCalc'] = parseInt(etapa['leadtime']) + qtdDomingos + parseInt(etapa['deslocamento'])
      etapa['fase'] = etapa['nome']
      etapa['sequenciaFase'] = etapa['seq']
      etapa['faseSequencia'] = (etapa['seq'] * 1000) + (etapa['nome'].charCodeAt(0) + etapa['nome'].length)
      verifPredecessor(endTask)
    })

  }


  const predecessorList = tasksRec[maquinaRec].reduce((acc, task) => {

    if (task.predecessor) {
      task.predecessor.split(',').forEach(predecessor1 => {
        let predecessor = parseInt(predecessor1 - 1)
        if (predecessor >= 0) {
          acc[predecessor] = acc[predecessor] || []
          acc['geral'] = acc['geral'] || []
          acc[predecessor].push(task.seq - 1)
          acc.geral.indexOf(predecessor) < 0 ? acc['geral'].push(predecessor) : ''
          acc.geral.sort((a, b) => { if (a > b) { return -1 } else { return true } })

        }
      })
    }

    return acc

  }, {})


  findEndTasks();

  return tasksRec;


}

// findEndTasks(tasksRec[maquinaRec]); // tasksRec[maquinaRec] e endDate

export default {



  computed: {

    maquinaCor() { // Mapeamento de máquinas para definição das cores

      return Object.keys(this.demanda2);

    },
    fasesFiltradas() {

      return this.demandaFiltrada.reduce((acc, fase) => {
        acc[fase.fase] = acc[fase.fase] || {}
        acc['fases'] = acc['fases'] || []
        acc[fase.fase]['rowspan'] = acc[fase.fase]['rowspan'] + 1 || 1
        acc['fases'].push(acc[fase.fase]['rowspan'] === 1 ? true : false)
        return acc
      }, {})

    },

    demandaFiltrada() {

      return this.filtroMaquina === '' && this.filtroSetor === '' && this.filtroFase === '' ? this.demandaOrdenada : this.demandaOrdenada.filter(maq => {
        return (this.filtroMaquina === '' || maq.maquina === this.filtroMaquina)
          &&
          (this.filtroSetor === '' || maq.setor === this.filtroSetor)
          &&
          (this.filtroFase === '' || maq.fase === this.filtroFase)
          &&
          (this.filtroStatus === '' || this.statusMaqProc[maq.maquina][maq.fase] === this.filtroStatus)
      })

    },

    demandaOrdenada() {

      function compare(a, b) {
        if (a.faseSequencia < b.faseSequencia) {
          return - 1;
        }
        else { return true }
      }


      return this.demandaCompilada.sort(compare);

    },

    dataHoje() {
      return moment().format("DD/MM/YYYY")
    },

    demandaCompilada() {

      return Object.keys(this.demanda2).reduce((acc, maquina) => {

        this.demanda2[maquina].forEach(fase => {


          fase['maquina'] = maquina

          this.rowspan[fase.fase] = this.rowspan[fase.fase] + 1 || 1

          acc.push(fase)

          acc.sort((a, b) => { if (a.startX < b.startX && a.nome === b.nome) { return -1 } else if (a.startX > b.startX && a.nome === b.nome) { return 1 } else { return 0 } })

        })

        return acc

      }, []);


    }
  },
  props: {
    demanda1: Array,
    buscarReg: Function,
    inserirReg: Function,
    atualizarReg: Function,
    compDemanda: Function
  },


  methods: {

    fDataHora(data) {
      return data? moment(data).format("DD/MM/YYYY HH:mm:ss") : ''
    },

    limparFiltros() {
      this.filtroMaquina = ''
      this.filtroFase = ''
      this.filtroSetor = ''
      this.filtroStatus = ''

    },
    listra(processo) {
      let indexProcesso = Object.values(this.fasesArray).indexOf(processo)
      return indexProcesso % 2 === 0 && indexProcesso !== 0 ? 'lightsteelblue' : ''
    },
    filtraRowspan(faseAtual) {
      let rowspanAtual = this.fasesFiltradas[faseAtual]
      // delete this.fasesFiltradas[faseAtual]
      return rowspanAtual
    },


    ajustaTexto(colspan) {

      if (colspan === 1) {
        return '0.6rem'
      } else if (colspan === 2) {
        return '0.7rem'
      } else if (colspan >= 3) {
        return '0.9rem'
      }

    },
    pressionadoControl(maquina) {

      this.dialogApontamento = false;

      this.filtroMaquina = maquina

    },
    converteData(dataString) {
      return moment(dataString).format("DD/MM/YYYY HH:MM:SS")
    },

    verifConcluido(maquina, fase) {

      if (this.statusMaqProc[maquina][fase]) {
        if (this.statusMaqProc[maquina][fase]['percentual'] === 100 || this.statusMaqProc[maquina][fase]['apontamento'] === 'OK') {

          return 2

        } else {
          return this.statusMaqProc[maquina][fase]['status']
        }

      }
    },

    buscarStatus() {

      this.qtdBloqueio = 0;

      this.buscarReg([{}, "Apontamento"]).then(res => {

        if (res.data.length > 0) {

          res.data.forEach(maqProcesso => {

            this.statusMaqProc[maqProcesso.maquina] = this.statusMaqProc[maqProcesso.maquina] || {}
            this.statusMaqProc[maqProcesso.maquina][maqProcesso.fase] = this.statusMaqProc[maqProcesso.maquina][maqProcesso.fase] || {}
            this.statusMaqProc[maqProcesso.maquina][maqProcesso.fase]['percentual'] = parseInt(maqProcesso.percentual)
            this.statusMaqProc[maqProcesso.maquina][maqProcesso.fase]['apontamento'] = maqProcesso.apontamento
            this.statusMaqProc[maqProcesso.maquina][maqProcesso.fase]['texto'] = maqProcesso.texto

          })

        }

      })

      return

    },
    confirmaApontamento() {

      let arquivo = {}
      arquivo.maquina = this.processoApontamento.maquina
      arquivo.fase = this.processoApontamento.sequenciaFase
      arquivo.idFase = this.processoApontamento.idFase
      arquivo.percentual = this.statusMaqProc[this.processoApontamento.maquina][this.processoApontamento.sequenciaFase]['percentual']
      arquivo.apontamento = this.statusMaqProc[this.processoApontamento.maquina][this.processoApontamento.sequenciaFase]['apontamento']
      arquivo.texto = this.processoApontamento.texto
      arquivo.dataHora = moment();

      if (this.processoApontamento['idApontamento']) {
        arquivo._id = this.processoApontamento.idApontamento
        this.atualizarReg([arquivo, 'Apontamento']);
      } else {
        this.inserirReg([arquivo, 'Apontamento']);
      }
      this.dialogApontamento = false;

    },


    modalApontamento(processo, event) {
      this.processoApontamento = processo;
      this.processoApontamento['idFase'] = processo._id
      this.statusFase = ''

      this.buscarReg([{ maquina: this.processoApontamento.maquina, idFase: this.processoApontamento.idFase }, "Apontamento"]).then(res => {

        if (res.data.length > 0) {

          this.processoApontamento['idApontamento'] = res.data[0]['_id'];
          this.processoApontamento['percentual'] = res.data[0]['percentual']
          this.processoApontamento['apontamento'] = res.data[0]['apontamento']
          this.processoApontamento['texto'] = res.data[0]['texto']
          this.processoApontamento['dataHora'] = res.data[0]['dataHora']

        }

        // this.processoApontamento['apontamento'] ? this.statusFase = this.processoApontamento['apontamento'] : ''

      })


      // this.atualizaStatus(processo); // Atualiza apontamento para mostrar na tela modal
      this.dialogApontamento = true;

    },

    cntQtdStatus() {
      /* 
        this.statusMaqProc[maquina][fase]['status'] = 2 // Status Concluído
        */
      this.qtdStatus = {}
      Object.keys(this.statusMaqProc).forEach(maquina => {
        // console.log("Máuqina: ", this.statusMaqProc[maquina])
        Object.values(this.statusMaqProc[maquina]).forEach(fase => {
          // console.log("Máquina: ", maquina, " - Fase: ", fase)
          this.qtdStatus[fase['status']] = this.qtdStatus[fase['status']] || 0
          this.qtdStatus[fase['status']]++;
        })
      })

      return

    },

    atualizaStatus(processoAtual, alteraApontamento) {
      let maquina = processoAtual.maquina
      let fase = processoAtual.sequenciaFase
      let hoje = moment(this.dataHoje, "DD/MM/YYYY").format('X');
      let inicio = processoAtual.startX
      let fim = processoAtual.endX


      /*      
            status: 1 // 0 = Normal, 1 = Em andamento, 2 = Concluído, 3 = Atrasado, 4 = Faturado, 5 = Forecast Atrasado
       statusMaqProc[processo.maquina][processo.sequenciaFase]['apontamento']
        */


      this.statusMaqProc[maquina] = this.statusMaqProc[maquina] || {}

      this.statusMaqProc[maquina][fase] = this.statusMaqProc[maquina][fase] || { percentual: 0, status: 0, apontamento: '' }

      alteraApontamento === true ? this.statusMaqProc[maquina][fase]['apontamento'] = this.processoApontamento['apontamento'] : ''

      // alteraApontamento ? this.statusMaqProc[maquina][fase]['percentual'] = this.apontamentoOK ? 100 : 0 : '';

      // this.statusMaqProc[maquina][fase]['apontamento'] !== undefined ? console.log(this.statusMaqProc[maquina][fase]['apontamento']) : ''

      if (this.cadastroMaq[maquina]?.statusVenda === 'Forecast' &&
        moment(this.cadastroMaq[maquina]['dataInclusao']).isBefore(moment().subtract(105, 'd')) &&
        hoje > fim
      ) {

        this.statusMaqProc[maquina][fase]['status'] = 5 // Status Forecast 15 semanas

      } else if (this.cadastroMaq[maquina]['statusVenda'] === 'Faturada') {

        this.statusMaqProc[maquina][fase]['status'] = 4 // Status Faturado

      } else if (this.statusMaqProc[maquina][fase]['apontamento'] === 'OK' || this.statusMaqProc[maquina][fase]['percentual'] === 100) {

        this.statusMaqProc[maquina][fase]['status'] = 2 // Status Concluído

      } else if (this.statusMaqProc[maquina][fase]['apontamento'] === 'NA') {

        this.statusMaqProc[maquina][fase]['status'] = 6 // Status Não Aplica

      } else if (this.statusMaqProc[maquina][fase]['apontamento'] === 'EA' || inicio < hoje && hoje < fim || this.statusMaqProc[maquina][fase]['apontamento'] === 'BQ') {

        this.statusMaqProc[maquina][fase]['status'] = 1 // Status em andamento

        if (this.statusMaqProc[maquina][fase]['apontamento'] === 'BQ') {
          this.qtdBloqueio++;
        }

      } else if (hoje >= fim) {

        this.statusMaqProc[maquina][fase]['status'] = 3 // Status atrasado

      }

      return this.cntQtdStatus();


    },


    modalArquivo() {
      this.buscarReg([{}, 'GanttComercial']).then(res => {

        this.listaArquivos = res.data

      })

      return this.dialogAbrir = true;

    },


    abrirArquivo() {

      // this.atualizaVendas(); ??? Modificado

      // this.atualizaCadProcesso(); ??? Modificado

      this.dialogAbrir = false;

      this.semanas = this.arquivoSelecionado.semanas

      this.demandaCliente = this.arquivoSelecionado.demanda

      //this.statusMaqProc = {} // Zerar status atual

      this.apontamentoOK = false; // Zerar apontamento

      return this.listarMaquinas2(this.demandaCliente);

    },

    minMaxData(valores) {
      let dataMin = Math.min(...valores.map(proc => parseInt(proc.startX)))
      let dataMax = Math.max(...valores.map(proc => parseInt(proc.endX)))

      this.dataInicio = new Date(Date.parse(moment(dataMin, "X").subtract(1, 'week').format("MM-DD-YYYY")));
      this.dataFim = new Date(Date.parse(moment(dataMax, "X").add(1, 'week').format("MM-DD-YYYY")));

      this.fasesArray = Object.keys(this.fasesFiltradas)


      return this.dataAlterada();

    },


    listarMaquinas2(demandaCliente) {

      this.buscarStatus();
      this.demanda2 = {}

      Object.keys(demandaCliente).forEach(linha => {

        Object.keys(demandaCliente[linha]).forEach(semana => {
          demandaCliente[linha][semana].forEach(maquina => {
            // console.log(this.cadastroProc[linha])
            let endDate = moment(semana, "ww/YY").endOf('isoWeek').add(5, 'days').format('X');
            this.demanda2[maquina] = JSON.parse(JSON.stringify(this.cadastroProc[linha].slice()))
            // calcMachine(this.demanda2, maquina, endDate)
            calcMachine(this.demanda2, maquina, endDate, this.statusMaqProc)[maquina].forEach(fase => {
              this.listaSetor[fase.setor] = this.listaSetor[fase.setor] || {}
              this.listaSetor[fase.setor][fase.nome] = this.listaSetor[fase.setor][fase.nome] + 1 || 0
              this.listaFase[fase.nome] = this.listaFase[fase.nome] + 1 || 0
              this.atualizaStatus(fase, false)
            })
          })
        })
      })

      return this.minMaxData(this.demandaCompilada);


    },


    atualizaGantt(processo, dias) {
      let diasInt = [...dias]
      let diaIni = moment(processo.startX, "X").format("DD/MM/YYYY")
      let posIni = dias.indexOf(diaIni)
      let leadTimeMaq = processo.leadtimeCalc

      if (posIni >= 0) {
        let newDias = [...dias]
        newDias.splice(posIni + 1, leadTimeMaq - 1)

        return newDias.reduce((acc, element) => {
          acc[element] = element == diaIni ? processo.leadtimeCalc : 0

          return acc
        }, {})

      }
    },

    // Lista máquinas para atribuir cor no Gantt
    vCorMaquina() {
      this.demanda1.forEach(maquinaLinha => {
        this.maquinaCor.indexOf(maquinaLinha.maquina) === -1 ? this.maquinaCor.push(maquinaLinha.maquina) : ''
      })
    },

    // Atualiza cálculos de data 
    dataAlterada() {

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
          let semana = diaLeitura.format('ww')


          this.diasMes.push(diaLeitura.format('DD/MM/YYYY'))
          this.teste.push(diaLeitura.format('DD/MM/YYYY'))

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

    atualizaCadProcesso() {
      this.buscarReg([{}, 'Processos']).then(
        res => {

          this.cadastroProc = res.data.reduce((acc, elem) => {
            acc[elem.linha] = acc[elem.linha] || [];
            acc[elem.linha].push(elem)
            acc[elem.linha].sort((a, b) => { if (parseInt(a.seq) < parseInt(b.seq)) { return -1; } else { return true; } })

            return acc

          }, {})
        }
      )
    },

    atualizaVendas() {
      this.buscarReg([{}, 'Vendas']).then(
        res => {

          this.cadastroMaq = res.data.reduce((acc, elem) => {
            acc[elem.maquina] = acc[elem.maquina] || [];
            acc[elem.maquina] = elem

            return acc

          }, {})
        }
      )
    }

  },
  mounted() {

    this.atualizaCadProcesso(); // Atualiza cadastro de processos ao iniciar

    this.atualizaVendas(); // Atualiza vendas ao iniciar

    this.buscarStatus();
    this.dataInicio = new Date();
    // Atualiza processos engenharia


  },

  data() {
    return {
      qtdBloqueio: 0, // Contador de quantidade de bloqueios apontados
      listaFase: {}, // Lista de fases do Gantt
      listaSetor: {}, // Lista de Setores do Gantt
      filtroMaquina: '', // Filtro de máquina para mostrar no Gantt
      filtroSetor: '', // Filtro de Setor para mostrar no Gantt
      filtroFase: '', // Filtro de Fase para mostrar no Gantt
      filtroStatus: '', // Filtro de Status para mostrar no Gantt
      ctrlPressionado: false, // Tecla Control está pressionada
      rowspan: {}, // Variavel para colpsan das linhas relacionadas a fase do processo
      dialogApontamento: false, // Flag para sinalizar abertura da tela modal para apontamento das fases e etapas
      processoApontamento: '', // Processo atual para fazer o apontamento
      apontamentoOK: false, // Apontamento Ok para a fase atual
      dialogAbrir: false, // Flag para sinalizar abertura da tela modal para seleção de arquivos
      listaArquivos: [], // Lista de arquivos salvos
      cadastroMaq: {}, //Cadastro de máquinas a serem produzidas
      cadastroProc: {}, // Cadastro de processos
      demanda: {}, // Variável para armazenar a demanda de máquinas por linha
      demanda2: {}, // Variável para armazenar a demanda de máquinas por linha
      demandaCliente: {}, // Demanda com base no prazo final para o cliente, data por máquina
      inicioProg: new Date('05-01-2023'), // Variavel para a data de início da primeira máquina
      teste: [], // Variavel para testes 
      dataInicio: '', // Data de início do Gráfico de Gantt
      dataFim: '', // Data de fim do Gráfico de Gantt
      difDataDias: 0, // Diferença de data em anos para calcular tamanho do eixo X do Gantt
      semanas: {}, //Semanas selecionadas
      diasSemanas: [], // Dias das semanas que foram selecionados
      diasMes: [], // Dias do Mes selecionados
      totalDias: 0, // Total de dias úteis da seleção
      qtdStatus: {}, // Variavel para contador de quantidade de ocorrência por Status
      listaClasseStatus: { // Lista de classes por status
        0: 'statusNormal',
        1: 'statusEmAndamento',
        2: 'statusConcluido',
        3: 'statusAtrasado',
        4: 'statusFaturado',
        5: 'statusFerecastAtrasado',
        6: 'statusNaoAplica'
      },

      statusMaqProc: {}, // Arquivo de status das máquinas x processos

      cores: [
        'aqua',
        'bisque',
        'darkgray',
        'darkseagreen',
        'lightblue',
        'lightpink',
        'palegreen',
        'paleturquoise',
        'silver',
        'skyblue',
        'aqua',
        'bisque',
        'darkgray',
        'darkseagreen',
        'lightblue',
        'lightpink',
        'palegreen',
        'paleturquoise',
        'silver',
        'skyblue',
        'aqua',
        'bisque',
        'darkgray',
        'darkseagreen',
        'lightblue',
        'lightpink',
        'palegreen',
        'paleturquoise',
        'silver',
        'skyblue',
      ],
      endDate: moment().format('X'),

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

.fixed-column {
  position: sticky;
  left: 0;
  z-index: 10;
  background-color: #f5f5f5;
}

.fases {
  font-size: small;
  font-weight: bold;
  white-space: nowrap;
  hyphens: none;
}

/*
table tbody,
table thead {
  display: block;
}

table tbody {
  overflow: auto;
  height: 100px;
}

*/
thead {
  position: sticky;
  top: 0;
  background-color: #f1f1f1;
  z-index: 10;
  /* Cor de fundo para destacar a linha */
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

.gradeGantt {
  border: 1px dotted lightgray;
  border-collapse: collapse;

}

.statusMaquina {
  border: 4px solid;
  border-radius: 7%;
}

.statusFaturado {
  background-color: gray;
  color: '';
  width: 100%;
}

.statusNaoAplica {
  background-color: lightgray;
  text-decoration: line-through;
  color: '';
  width: 100%;
}

.statusNormal {
  background-color: cornflowerblue;
  width: 100%;
}

.statusEmAndamento {
  background-color: rgb(239, 252, 65);
  width: 100%;
}

.statusFerecastAtrasado {
  background-color: red;
  color: yellow;
  width: 100%;
}

.statusAtrasado {
  background-color: orangered;
  color: '';
  width: 100%;
}

.statusConcluido {
  background-color: lime;
  color: '';
  width: 100%;
}

.legBloqueio {
  border-width: 1px;
  border-style: dotted;
}

.legenda {
  width: 5vw;
  padding-left: 1%;
  padding-right: 1%;
  position: relative;
  font-size: small;
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

.corMaquina {
  border-radius: 50%;
  display: inline;
  width: 10px;
  height: 10px;
}

.badge {
  position: absolute;
  top: -1vh;
  right: 0.3vw;
}

.badgeBloqueio {
  background-color: red;
  color: yellow;
  font-weight: 900;
  position: absolute;
  top: -1vh;
  left: -0.3vw;
}


.textoBloqueio {
  margin-top: 3vh;
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

::v-deep(.p-dropdown-label.p-inputtext) {
  font-size: small;
}

::v-deep(.p-float-label label) {
  font-size: small;
  padding: 0.1rem;
  margin-top: -1.3vh;
}
</style>