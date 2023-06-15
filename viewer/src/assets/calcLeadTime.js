export default function calcularLeadTime(atividadesRec) {
    let atividades = JSON.parse(JSON.stringify(atividadesRec.slice()))


    const atividadesMap = atividades.map((elem)=>{
        let predAtual = parseInt(elem.predecessor)
        elem.predecessor = []
        predAtual>=0 ? elem.predecessor.push(predAtual) : ''
        return elem
    })

    // const atividadesMap = atividades.map((elem)=>{
    //     elem.predecessor = elem.predecessor.split(',')
    //     return elem
    // })

    function calcularDuracaoMinimaAtividade(numeroAtividade) {
        const atividade = atividadesMap.find(a => a.seq === numeroAtividade);
        if (atividade === undefined) {
            return 0
        }else if (atividade.predecessor.length === 0 ) {
            // Se a atividade não tem dependências, sua duração mínima é igual à sua própria duração
            return parseInt(atividade.leadtime);
        } else {
            // Se a atividade tem dependências, calculamos a duração mínima das dependências
            const duracaoMinimaDependencias = Math.max(...atividade.predecessor.map(calcularDuracaoMinimaAtividade));
            // A duração mínima da atividade é a soma da duração mínima das dependências mais sua própria duração
            return parseInt(atividade.leadtime) + parseInt(duracaoMinimaDependencias) - (parseInt(atividade.deslocamento) || 0);
        }
    }


    const duracoesMinimas = atividadesMap.map(atividade => calcularDuracaoMinimaAtividade(atividade.seq));
    console.log("Durações minimas: ", duracoesMinimas)
    const duracaoMinimaTotal = Math.max(...duracoesMinimas);

    console.log(`A duração mínima total do projeto é de ${duracaoMinimaTotal} horas.`);

    return duracaoMinimaTotal;
}

