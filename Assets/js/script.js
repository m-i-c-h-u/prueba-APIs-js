
const resultadoSpan = document.querySelector('#resultado-span');
const errorElem = document.querySelector('#error');
const graficoCanvas = document.querySelector('#grafico');
const convertirBtn = document.querySelector('#convertir');
let grafico = null;

convertirBtn.addEventListener('click', async () => {
    const monto = parseFloat(document.querySelector('#monto').value);
    const moneda = document.querySelector('#moneda').value; 
    
    resultadoSpan.textContent = '';
    errorElem.textContent = '';

    if (monto <= 0 || isNaN(monto)) {
        errorElem.textContent = 'Por favor, ingresa un monto válido.';
        return;
    }

    if (moneda === "seleccione") {
        errorElem.textContent = 'Por favor, selecciona una moneda válida.';
        return;
    }

    try {
        
        const response = await fetch('https://mindicador.cl/api');
        if (!response.ok) throw new Error('No se pudo obtener los datos de la API.');

        const data = await response.json();

        const cambioMoneda = data[moneda]?.valor;
        if (!cambioMoneda) throw new Error(`La moneda ${moneda} no está disponible en mindicador.cl`);

        const resultado = (monto / cambioMoneda).toFixed(2);
        resultadoSpan.textContent = `${resultado} ${moneda.toUpperCase()}`;


        const historialResponse = await fetch(`https://mindicador.cl/api/${moneda}`);
        if (!historialResponse.ok) throw new Error('No se pudo obtener el historial de la moneda.');

        const historialData = await historialResponse.json();

        const fechas = historialData.serie.slice(0, 10).map(item => item.fecha.split('T')[0]);
        const valores = historialData.serie.slice(0, 10).map(item => item.valor);

        if (grafico) {
            grafico.destroy();
        }

        grafico = new Chart(graficoCanvas, {
            type: 'line',
            data: {
                labels: fechas.reverse(),
                datasets: [{
                    label: `Valor de ${moneda} últimos 10 días`,
                    data: valores.reverse(),
                    borderColor: 'hotpink',
                    borderWidth: 3,
                    fill: false,
                }]
            },
        });

    } catch (error) {
        console.error(error);
        errorElem.textContent = `Error: ${error.message}`;
    }
});