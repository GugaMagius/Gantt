<template>
  <div>

    <!-- Dropdown para seleção da linha de produção  -->
    <div>
      <div style="margin-top: 3vh">
        <Dropdown v-model="filterLinha" :options="linhas" optionLabel="label" optionValue="cod"
          placeholder="Selecione uma linha" @change="filtraProcessosLinha">
        </Dropdown>
        <Button icon="pi pi-pencil" @click="editLinha = !editLinha" />
      </div>
      <Dialog v-model:visible="editLinha" modal header="Editar Linhas" :style="{ width: '80vw' }">

        <div style="width: 95%;">

          <DataTable v-model:editingRows="editingRowsLinha" :value="linhas" editMode="row" dataKey="cod"
            @row-edit-save="onRowEditSaveLinha" tableClass="editable-cells-table" tableStyle="max-width: 95vw">
            <Column field="label" header="Linha" style="width: 10%">
              <template #editor="{ data, field }">
                <InputText v-model="data[field]" />
              </template>
            </Column>
            <Column field="cod" header="Codigo" style="width: 10%"
              :inputStyle="{ 'text-align': 'center', 'font-size': '0.9vw ' }">
              <template #editor="{ data, field }">
                <InputText v-model="data[field]" />
              </template>
            </Column>
            <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"
              :inputStyle="{ 'text-align': 'center' }"></Column>
            <Column field="check" header="" style="min-width:8%" :inputStyle="{ 'text-align': 'center' }"
              :sortable="false">
              <template #body="{ data }">
                <Button icon="pi pi-trash" severity="danger" rounded text
                  @click="linhas.splice(linhas.indexOf(data), 1)" />
              </template>
            </Column>
          </DataTable>

          <Button icon="pi pi-plus" @click="linhas.push({ label: 'NovaLinha', cod: 'nova' })" />
        </div>

      </Dialog>
    </div>

    <!-- Tabela de dados dos processos de produção  -->
    <div style="max-width: 80vw; margin:auto">
      <DataTable v-model:editingRows="editingRows" sortField="seq" :sortOrder="1" :value="processosLinha" editMode="row"
        dataKey="_id" @row-edit-save="onRowEditSave" tableClass="editable-cells-table" scrollable scrollHeight="70vh">
        <Column field="nome" :footer="'Total Leadtime da linha ' + filterLinha.toUpperCase()" header="Processo"
          style="width: 20%">
          <template #editor="{ data, field }">
            <InputText v-model="data[field]" />
          </template>
        </Column>
        <Column field="setor" header="Setor" style="width: 10%" bodyStyle="text-align:center">
          <template #editor="{ data, field }">
            <InputText v-model="data[field]" />
          </template>
        </Column>
        <Column field="seq" header="Fase" style="width: 10%" bodyStyle="text-align:center">
          <template #editor="{ data, field }">
            <InputText v-model="data[field]" style="width: 5vw;" />
          </template>
          <template #body="{ data, field, index }">
            {{ data[field] }}
          </template>
        </Column>
        <Column field="leadtime" :footer="totalLeadtimeProc" header="Lead Time" style="width: 10%"
          bodyStyle="text-align:center">
        </Column>
        <Column field="predecessor" header="Predecessor" style="width: 10%" bodyStyle="text-align:center">
          <template #editor="{ data, field }">
            <InputText v-model="data[field]" style="width: 5vw;" />
          </template>
        </Column>
        <Column field="deslocamento" header="Deslocamento" style="width: 10%" bodyStyle="text-align:center">
          <template #editor="{ data, field }">
            <InputText v-model="data[field]" style="width: 5vw;" />
          </template>
        </Column>
        <Column :rowEditor="true" style="width: 5%; min-width: 8rem" bodyStyle="text-align:center"></Column>
        <Column field="check" header="" style="min-width:8%" :sortable="false">
          <template #body="{ data }">
            <Button icon="pi pi-trash" severity="danger" rounded text
              @click="apagarReg([data, 'Processos']), this.atualizaListaProcessos()" />
          </template>
        </Column>
        <Column field="etapas" header="Etapas" style="min-width:8%" :sortable="false">
          <template #body="{ data, field, index }">

            <div><Button icon="pi pi-pencil" @click="editEtapas = true, processoEditing = data._id" /></div>

            <!-- Tela modal de cadastro das etapas do processo -->
            <Dialog v-model:visible="editEtapas" modal header="Editar Etapas" :style="{ width: '80vw' }">

              <div style="width: 95%; ">
                <DataTable v-model:editingRows="editingRowsEtapas" :value="this.processos[buscaIndex()]['etapas']"
                  sortField="seq" :sortOrder="1" editMode="row" dataKey="seq" @row-edit-save="onRowEditSaveEtapas"
                  tableClass="editable-cells-table">
                  <Column field="seq" :sortable="true" header="Codigo" style="width: 7vw" bodyStyle="text-align:center">
                    <template #editor="{ data, field }">
                      <InputText v-model="data[field]" style="width: 4vw;" />
                    </template>
                  </Column>
                  <Column field="nome" header="Etapa" style="width: 17vw">
                    <template #editor="{ data, field }">
                      <InputText v-model="data[field]" style="width: 15vw;" />
                    </template>
                  </Column>
                  <Column field="leadtime" header="Lead Time" style="width: 7vw" bodyStyle="text-align:center">
                    <template #editor="{ data, field }">
                      <InputText v-model="data[field]" style="width: 4vw;" />
                    </template>
                  </Column>
                  <Column field="predecessor" header="Prodecessor" style="width: 7vw" bodyStyle="text-align:center">
                    <template #editor="{ data, field }">
                      <InputText v-model="data[field]" style="width: 4vw;" />
                    </template>
                    <template #body="{ data, field }">
                      {{ data[field][0] }}
                    </template>
                  </Column>
                  <Column field="deslocamento" header="Deslocamento" style="width: 7vw" bodyStyle="text-align:center">
                    <template #editor="{ data, field }">
                      <InputText v-model="data[field]" style="width: 4vw;" />
                    </template>
                  </Column>
                  <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
                  <Column field="check" header="" style="min-width:8%" :sortable="false">
                    <template #body="{ data, index }">
                      <Button icon="pi pi-trash" severity="danger" rounded text @click="apagarEtapa(index)" />
                    </template>
                  </Column>
                </DataTable>

                <Button icon="pi pi-plus" @click="adicionarEtapas" />

              </div>

            </Dialog>
          </template>
        </Column>

        <template #footer>
          <Column> Coluna 1</Column>
          <Column> Coluna 2</Column>
          <Column> Coluna 3</Column>
        </template>
      </DataTable>
      <Button icon="pi pi-plus" @click="adicionarProcesso" />

    </div>
  </div>
</template>

<script>
import calcLeadTime from '../assets/calcLeadTime'


const Processo = {
  create(seq, nome, setor, linha, predecessor, deslocamento) {
    const processo = {
      seq,
      nome,
      setor,
      linha,
      predecessor,
      deslocamento
    };
    return processo;
  }
};
const Etapas = {
  create(etapa, nome, predecessor, leadtime, deslocamento) {
    const processo = {
      etapa,
      nome,
      predecessor,
      leadtime,
      deslocamento
    };
    return processo;
  }
};

export default {
  data() {
    return {
      processosLinha: [], // Processos filtrados para a linha selecionada
      editLinha: false, // Exibe modal para editar linhas de produção
      addLinha: false, // Inclui nova linha de produçãop
      editEtapas: false, // Exibe modal para editar etapas do processo
      editingRowsLinha: [], // Linha em edição para linhas de produção 
      editingRows: [], // Linha em edição para Processo de produção
      editingRowsEtapas: [], // Linha em edição para Etapas do processo de produção
      etapasTmp: {}, // Etapas temporaria para inserir nova etapa no processo
      inserir: false, // Exibe formulario de cadastro
      processos: [], // Cadastro de processos BD
      etapasProcesso: {}, // Etapas do processos BD
      processoCad: '',
      linhaCad: '',
      etapaCad: '',
      linhas: [{ label: 'Linha Pesada', cod: 'pesada' }, { label: 'Linha Leve', cod: 'leve' }],
      filterLinha: 'pesada',
      processoEditing: 0, // Index do processo em edição
    }
  },
  props: {
    inserirReg: Function,
    buscarReg: Function,
    atualizarReg: Function,
    apagarReg: Function,
    respBD: Array
  },
  computed: {

    totalLeadtimeProc() {
      // return calcLeadTime(this.processos)
      return this.processos.reduce((acc, elem) => {
        if (elem.linha === this.filterLinha) { acc = acc + parseInt(elem.leadtime) - (parseInt(elem.deslocamento || 0)) }
        return acc
      }, 0)
    }

  },
  mounted() {


    this.atualizaListaProcessos();


  },
  methods: {
    filtraProcessosLinha() {
      this.processosLinha = this.processos.filter(processo => processo.linha === this.filterLinha)

      return this.mapeiaSequencia();
    },
    mapeiaSequencia() {
      this.processoLinha = this.processosLinha.map((processo, index) => {
        processo.seq = index + 1
        return processo
      })
      return this.ordenaSequenciaLinha();

    },
    ordenaSequenciaLinha() {
      this.processosLinha = this.processosLinha.sort((a, b) => { if (a.seq < b.seq) { return -1 } else { return true } })

    },

    atualizaListaProcessos() {
      this.buscarReg([{}, 'Processos']).then(
        res => {
          this.processos = res.data.sort((a, b) => { if (a.seq < b.seq) { return -1 } else { return true } })
        }
      )
      return setTimeout(this.filtraProcessosLinha, 200);
    },
    buscaIndex() {
      return this.processos.findIndex((processo) => { return processo._id === this.processoEditing })
    },
    adicionarProcesso() {
      let novoProcesso = Processo.create(this.processosLinha.length + 1, 'Processo', '',this.filterLinha)
      this.processosLinha.push(novoProcesso)
      
      this.editingRows.push(novoProcesso)

      return this.mapeiaSequencia();
    },
    adicionarEtapas() {
      let indexProcesso = this.buscaIndex();
      this.processos[indexProcesso]['etapas'] = this.processos[indexProcesso]['etapas'] || [];
      let novaEtapa = {
        seq: this.processos[indexProcesso]['etapas'].length + 1 || 1,
        nome: 'Etapa',
        leadtime: 0,
        predecessor: '',
        deslocamento: ''
      }
      this.processos[indexProcesso]['etapas'].push(novaEtapa)
      this.editingRowsEtapas.push(novaEtapa)

    },
    apagarEtapa(index) {
      console.log("INDEX: ", index)
      let indexProcesso = this.buscaIndex();

      this.processos[indexProcesso]['etapas'].splice(index, 1)

      console.log(this.processos[indexProcesso]['etapas'])

      let ltEtapa = calcLeadTime(this.processos[indexProcesso]['etapas'])

      this.processos[indexProcesso]['leadtime'] = ltEtapa

      this.atualizaRegProcesso(this.processos[this.buscaIndex()])
    },

    atualizaRegProcesso(dados) {

      if (dados._id) {
        this.atualizarReg([dados, 'Processos'])
      }
      else {
        this.inserirReg([dados, 'Processos'])
      }

      setTimeout(this.atualizaListaProcessos, 300);
    },
    atualizaSeqRegistros() {
      this.processosLinha.forEach((processo, indexProc) => {
          // console.log("processo: ", processo.nome, " - index: ", indexProc)

          processo['seq'] = indexProc;
          this.atualizaRegProcesso(processo, 'Processos')

        })
    },

    onRowEditSave(event) {
      let { newData, index } = event;

      newData['deslocamento'] = newData['deslocamento'] || 0


      if (newData.seq !== this.processosLinha[index]) {


        if (parseInt(newData.seq) > parseInt(index)) {
          this.processosLinha.splice((parseInt(newData.seq)), 0, newData)
          this.processosLinha.splice(index, 1)
        } else {
          this.processosLinha.splice((parseInt(newData.seq) - 1), 0, newData)
          this.processosLinha.splice(index + 1, 1)
        }


        // console.log("Finalizando ajustes")


      } else {

        this.atualizaRegProcesso(newData, 'Processos')
      }



      // this.processos.forEach((processo, indexFE) => {
      //   if (processo.seq >= newData.seq && processo.seq <= index) {
      //     processo.seq++
      //     this.atualizaRegProcesso(processo, 'Processos')
      //   }
      //   else {
      //     this.atualizaRegProcesso(newData, 'Processos')
      //   }
      // })

      return this.mapeiaSequencia(), this.atualizaSeqRegistros();

      //return this.filtraProcessosLinha();

      //return this.atualizaListaProcessos()
    },

    onRowEditSaveLinha(event) {
      let { newData, index } = event;

      this.linhas[index] = newData;
    },

    onRowEditSaveEtapas(event) {
      let { newData, index } = event;
      let indexProcesso = this.buscaIndex()

      this.processos[indexProcesso]['etapas'][index] = newData;

      let ltEtapa = calcLeadTime(this.processos[indexProcesso]['etapas'])

      this.processos[indexProcesso]['leadtime'] = ltEtapa

      this.atualizaRegProcesso(this.processos[indexProcesso])

    }
  }
}
</script>

<style scoped></style>