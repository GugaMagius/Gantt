<template>
  <div>
    <div style="max-width: 100%; margin:auto; overflow-y: auto; height: 88vh;">
      <DataTable v-model:editingRows="editingRows" stripedRows scrollable scrollHeight="80vh" sortField="seq"
        :sortOrder="1" class="p-datatable-sm" filterDisplay="row" :value="vendas" editMode="row" dataKey="maquina"
        @row-edit-save="onRowEditSave" tableClass="editable-cells-table">
        <Column field="seq" :sortable="true" header="Seq." style="width: 5%">
          <template #editor="{ data, field }">
            <InputText v-model="data[field]" style="width: 4vw" />
          </template>
          <template #body="{ data, field, index }">
            {{ data[field] }}
          </template>
        </Column>
        <Column field="maquina" sortable header="Maquina" style="width: 10%">
          <template #editor="{ data, field }">
            <InputText v-model="data[field]" style="width: 6vw;" />
          </template>
        </Column>
        <Column field="linha" sortable header="Linha" style="width: 11%">
          <template #editor="{ data, field }">
            <Dropdown v-model="data[field]" :options="linhas" optionLabel="label" style="width: 8vw;" />
          </template>
          <template #body="{ data, field }">
            {{ data[field].label }}
          </template>
        </Column>
        <Column field="cliente" sortable header="Cliente" style="width: 10%">
          <template #editor="{ data, field }">
            <InputText v-model="data[field]" style="width: 8vw;" />
          </template>
        </Column>
        <Column field="localMnt" sortable header="Local Montagem" style="width: 10%">
          <template #editor="{ data, field }">
            <div class="flex flex-wrap gap-3">
              <div class="flex align-items-center">
                <RadioButton v-model="data[field]" inputId="Magius" name="Magius" value="magius" />
                <label for="Magius" class="ml-2">Magius</label>
              </div>
              <div class="flex align-items-center">
                <RadioButton v-model="data[field]" inputId="Revenda" name="Revenda" value="revenda" />
                <label for="Revenda" class="ml-2">Revenda</label>
              </div>
            </div>
          </template>
        </Column>
        <Column field="statusVenda" sortable header="Status Venda" style="width: 6%">
          <template #editor="{ data, field }">
            <div class="flex flex-wrap gap-3">
              <div class="flex align-items-center">
                <RadioButton v-model="data[field]" inputId="Faturado" name="Faturado" value="Faturado" />
                <label for="Faturado" class="ml-2">Faturado</label>
              </div>
              <div class="flex align-items-center">
                <RadioButton v-model="data[field]" inputId="Pedido" name="Pedido" value="Pedido" />
                <label for="Pedido" class="ml-2">Pedido</label>
              </div>
              <div class="flex align-items-center">
                <RadioButton v-model="data[field]" inputId="Forecast" name="Forecast" value="Forecast" />
                <label for="Forecast" class="ml-2">Forecast</label>
              </div>
            </div>
          </template>
        </Column>
        <Column field="dataInclusao" sortable header="Data Inclusão" style="width: 20%">
          <template #body="{ data, field, index }">
            {{ formataData(data[field]) }}
          </template>
        </Column>
<!-- 
        <Column field="dataFaturado" sortable header="Data Faturamento" style="width: 20%">
          <template #body="{ data, field, index }">
            {{ cData([data, index]) }}
          </template>
        </Column> -->
        <Column field="observacoes" header="Observações" style="width: 20%">
          <template #editor="{ data, field }">
            <InputText v-model="data[field]" style="width: 15vw;" />
          </template>
        </Column>
        <Column :rowEditor="true" style="width: 5%; min-width: 8rem" bodyStyle="text-align:center"></Column>
        <Column field="check" header="" style="min-width:8%" :sortable="false">
          <template #body="{ data }">
            <Button icon="pi pi-trash" severity="danger" rounded text
              @click="apagarReg([data, 'Vendas']), this.atualizarVendas()" />
          </template>
        </Column>
      </DataTable>
      <Button icon="pi pi-plus" v-if="editingRows.length===0" @click="adicionarVenda" />

      <Dialog v-model:visible="alertaDialog" modal header="Header" :style="{ width: '50vw' }">
        <p>
          Cadastro de venda NÃO inserido! Já existe uma máquina cadastrada com este mesmo código! Favor verificar o código
          e cadastrar novamente.
        </p>
      </Dialog>

    </div>
  </div>
</template>

<script>
import moment from 'moment'

const Venda = {
  create(seq, maquina, linha, cliente, localMnt, statusVenda, forecast, semanaInicio, dataFaturado, Observacoes, dataInclusao) {
    const venda = {
      seq,
      maquina,
      linha,
      cliente,
      localMnt,
      statusVenda,
      forecast,
      semanaInicio,
      dataFaturado,
      Observacoes,
      dataInclusao
    };
    return venda;
  }
};


export default {
  data() {
    return {
      alertaDialog: false, // Liga / Desliga alerta referente a falha de máquina já cadastrada
      semanaInicio: '', // Semana para início da programação
      editLinha: false, // Exibe modal para editar linhas de produção
      addLinha: false, // Inclui nova linha de produção
      editEtapas: false, // Exibe modal para editar etapas do processo
      editingRowsLinha: [], // Linha em edição para linhas de produção 
      editingRows: [], // Linha em edição para Processo de produção
      editingRowsEtapas: [], // Linha em edição para Etapas do processo de produção
      etapasTmp: {}, // Etapas temporaria para inserir nova etapa no processo
      inserir: false, // Exibe formulario de cadastro
      vendas: [], // Cadastro de vendas BD
      etapasProcesso: {}, // Etapas do processos BD
      processoCad: '',
      linhaCad: '',
      etapaCad: '',
      linhas: [{ label: 'Pesada', cod: 'pesada' }, { label: 'Leve', cod: 'leve' }],
      filterLinha: 'leve',
      processoEditing: 0 // Index do processo em edição
    }
  },


  props: {
    inserirReg: Function,
    buscarReg: Function,
    atualizarReg: Function,
    apagarReg: Function,
    respBD: Array
  },


  mounted() {

    this.atualizarVendas();

  },


  methods: {
    formataData(data) {

      return moment(data).format("DD/MM/YYYY HH:MM:SS")

    },


    mapeiaSequencia() {

      this.vendas = this.vendas.map((maquina, index) => {
        console.log("Sequencia: ", maquina.seq, " - index: ", index)
        maquina.seq = index
        return maquina
      })
      return this.ordenaSequenciaVendas(), console.log("Concluido mapeamento de vendas");

    },


    ordenaSequenciaVendas() {

      this.vendas = this.vendas.sort((a, b) => { if (a.seq < b.seq) { return -1 } else { return true } })

    },


    adicionarVenda() {

      let novaVenda = Venda.create(this.vendas.length, '-', '-', '-', '-', '-', '-', '-', 0, '-', new Date())
      this.vendas.push(novaVenda)
      this.editingRows.push(novaVenda)

    },


    atualizarVendas() {

      this.buscarReg([{}, 'Vendas']).then(
        res => {
          this.vendas = res.data.sort((a, b) => { if (a.seq < b.seq) { return -1 } else { return true } })

          return this.mapeiaSequencia();
        }
      )
    },


    onRowEditSave(event) {
      let { newData } = event;
      let index = this.vendas.map(maquina => maquina.maquina).indexOf(newData.maquina)


      this.buscarReg([{}, "Vendas"]).then(res => {

        if (!newData._id && res.data.some(venda => {
          // console.log("Máquina venda: ", venda.maquina, " - Máquina Registro: ", registro.maquina)
          return venda.maquina === newData.maquina
        }
        )) {
          console.log("Registro já existe, favor verificar")
          this.alertaDialog = true;

        } else {
          console.log("NEW DATA: ", newData.seq)
          console.log("Index: ", this.vendas[index] + 1)


          if (index < 0) {
            let qtdVendas = this.vendas.length
            this.vendas.splice((parseInt(newData.seq)), 0, newData)
            this.vendas.splice(qtdVendas, 1)
          } else if (parseInt(newData.seq) > parseInt(index)) {
            this.vendas.splice((parseInt(newData.seq) + 1), 0, newData)
            this.vendas.splice(index, 1)
          } else {
            this.vendas.splice((parseInt(newData.seq)), 0, newData)
            this.vendas.splice(index + 1, 1)
          }




          this.mapeiaSequencia(), this.atualizaSeqRegistros();
        }

      })

      return setTimeout(this.atualizarVendas, 1000);
    },
    atualizaSeqRegistros() {
      this.vendas.forEach((maquina, indexVenda) => {

        maquina['seq'] = indexVenda;
        this.atualizaRegVenda(maquina, 'Vendas')

      })
    },

    atualizaRegVenda(registro) {

      if (registro._id) {
        this.atualizarReg([registro, 'Vendas'])
      }
      else {
        this.inserirReg([registro, 'Vendas'])
      }

      setTimeout(this.atualizarVendas, 100)
    },
    cData([dados, index]) {
      return dados.statusVenda == 'Faturado' ? moment(dados.dataFaturado).format("DD/MM/YY") : ''
    }

  }
}
</script>

<style></style>