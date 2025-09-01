document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const minNumberInput = document.getElementById('min-number');
    const maxNumberInput = document.getElementById('max-number');
    const quantityInput = document.getElementById('quantity');
    const drawButton = document.getElementById('draw-button');
    const resultsContainer = document.getElementById('results-container');
    const numbersDisplay = document.getElementById('numbers-display');
    const copyButton = document.getElementById('copy-button');
    const copyFeedback = document.getElementById('copy-feedback');

    let drawnNumbers = [];

    // Event listeners
    drawButton.addEventListener('click', drawNumbers);
    copyButton.addEventListener('click', copyNumbers);

    // Validação em tempo real dos inputs
    minNumberInput.addEventListener('input', validateInputs);
    maxNumberInput.addEventListener('input', validateInputs);
    quantityInput.addEventListener('input', validateInputs);

    function validateInputs() {
        const minNum = parseInt(minNumberInput.value);
        const maxNum = parseInt(maxNumberInput.value);
        const quantity = parseInt(quantityInput.value);

        // Validar se o número máximo é maior que o mínimo
        if (maxNum <= minNum) {
            maxNumberInput.setCustomValidity('O número máximo deve ser maior que o mínimo');
        } else {
            maxNumberInput.setCustomValidity('');
        }

        // Validar se a quantidade não excede o range disponível
        const availableNumbers = maxNum - minNum + 1;
        if (quantity > availableNumbers) {
            quantityInput.setCustomValidity(`Máximo de ${availableNumbers} números disponíveis neste range`);
        } else {
            quantityInput.setCustomValidity('');
        }
    }

    function drawNumbers() {
        // Limpar feedback anterior
        clearFeedback();

        // Obter valores dos inputs
        const minNum = parseInt(minNumberInput.value);
        const maxNum = parseInt(maxNumberInput.value);
        const quantity = parseInt(quantityInput.value);

        // Validações
        if (isNaN(minNum) || isNaN(maxNum) || isNaN(quantity)) {
            showError('Por favor, preencha todos os campos com números válidos.');
            return;
        }

        if (minNum >= maxNum) {
            showError('O número máximo deve ser maior que o número mínimo.');
            return;
        }

        if (quantity <= 0) {
            showError('A quantidade deve ser maior que zero.');
            return;
        }

        const availableNumbers = maxNum - minNum + 1;
        if (quantity > availableNumbers) {
            showError(`Não é possível sortear ${quantity} números únicos no range de ${minNum} a ${maxNum}. Máximo disponível: ${availableNumbers}`);
            return;
        }

        // Realizar o sorteio
        drawnNumbers = performDraw(minNum, maxNum, quantity);
        
        // Exibir resultados
        displayResults(drawnNumbers);
        
        // Mostrar container de resultados
        resultsContainer.style.display = 'block';
        
        // Scroll suave para os resultados
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    function performDraw(min, max, quantity) {
        const numbers = [];
        const availableNumbers = [];

        // Criar array com todos os números disponíveis
        for (let i = min; i <= max; i++) {
            availableNumbers.push(i);
        }

        // Sortear números únicos
        for (let i = 0; i < quantity; i++) {
            const randomIndex = Math.floor(Math.random() * availableNumbers.length);
            const drawnNumber = availableNumbers.splice(randomIndex, 1)[0];
            numbers.push(drawnNumber);
        }

        // Ordenar os números sorteados
        return numbers.sort((a, b) => a - b);
    }

    function displayResults(numbers) {
        numbersDisplay.innerHTML = '';
        
        numbers.forEach(number => {
            const numberElement = document.createElement('span');
            numberElement.className = 'number-item';
            numberElement.textContent = number;
            numbersDisplay.appendChild(numberElement);
        });
    }

    function copyNumbers() {
        if (drawnNumbers.length === 0) {
            showError('Nenhum número foi sorteado ainda.');
            return;
        }

        const numbersText = drawnNumbers.join(', ');

        // Tentar copiar usando a API moderna
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(numbersText).then(() => {
                showSuccess('Números copiados para a área de transferência!');
            }).catch(() => {
                fallbackCopy(numbersText);
            });
        } else {
            // Fallback para navegadores mais antigos
            fallbackCopy(numbersText);
        }
    }

    function fallbackCopy(text) {
        // Criar elemento temporário para copiar
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        
        try {
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            
            if (successful) {
                showSuccess('Números copiados para a área de transferência!');
            } else {
                showError('Não foi possível copiar os números. Tente selecionar manualmente.');
            }
        } catch (err) {
            showError('Não foi possível copiar os números. Tente selecionar manualmente.');
        } finally {
            document.body.removeChild(textArea);
        }
    }

    function showSuccess(message) {
        copyFeedback.textContent = message;
        copyFeedback.className = 'copy-feedback success';
        
        // Remover mensagem após 3 segundos
        setTimeout(() => {
            clearFeedback();
        }, 3000);
    }

    function showError(message) {
        copyFeedback.textContent = message;
        copyFeedback.className = 'copy-feedback error';
        
        // Remover mensagem após 5 segundos
        setTimeout(() => {
            clearFeedback();
        }, 5000);
    }

    function clearFeedback() {
        copyFeedback.className = 'copy-feedback';
        copyFeedback.textContent = '';
    }

    // Permitir navegação com Enter entre os campos
    minNumberInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            maxNumberInput.focus();
        }
    });

    maxNumberInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            quantityInput.focus();
        }
    });

    quantityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            drawNumbers();
        }
    });

    // Animação de carregamento no botão
    function setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.style.opacity = '0.7';
            button.style.cursor = 'not-allowed';
        } else {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        }
    }

    // Validação inicial
    validateInputs();
});

