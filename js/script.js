document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('rh-form');
    const processTypeSelect = document.getElementById('process-type');
    const admissaoSection = document.getElementById('admissao-section');
    const demissaoSection = document.getElementById('demissao-section');
    const recordsList = document.getElementById('records-list');
    const noRecordsMessage = document.getElementById('no-records-message');
    const recordModal = document.getElementById('record-modal');
    const modalContent = document.getElementById('modal-content');
    const messageModal = document.getElementById('message-modal');
    const modalMessageText = document.getElementById('modal-message-text');
    const recordToDemitIdInput = document.getElementById('record-to-demit-id');
    const searchInput = document.getElementById('search-input');

    const showAllBtn = document.getElementById('show-all');
    const showDemitidosBtn = document.getElementById('show-demitidos');

    let records = JSON.parse(localStorage.getItem('rhRecords')) || [];
    let filter = 'all'; // all ou demitidos

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const showMessage = (message) => {
        modalMessageText.textContent = message;
        messageModal.classList.remove('hidden');
        messageModal.classList.add('flex');
        setTimeout(() => {
            messageModal.classList.remove('flex');
            messageModal.classList.add('hidden');
        }, 2000);
    };

    const showRecordDetails = (record) => {
        const modalTitle = record.type === 'admissao' ? 'Detalhes da Admissão' : 'Detalhes da Demissão';
        const specificInfo = record.type === 'demissao'
            ? `<p><strong>Data de Admissão:</strong> ${formatDate(record.admissionDate)}</p>
               <p><strong>Data de Demissão:</strong> ${formatDate(record.terminationDate)}</p>
               <p class="mt-4"><strong>Motivo da Demissão:</strong></p><p class="whitespace-pre-wrap">${record.terminationReason}</p>`
            : `<p><strong>Data de Admissão:</strong> ${formatDate(record.admissionDate)}</p>
               <p><strong>Salário:</strong> R$ ${record.salary}</p>`;

        modalContent.innerHTML = `
            <div class="flex justify-between items-center border-b pb-3 mb-4">
                <h2 class="text-2xl font-bold">${modalTitle}</h2>
                <button id="close-modal" class="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
            </div>
            <div class="space-y-4">
                <p><strong>Nome:</strong> ${record.fullName}</p>
                <p><strong>CPF:</strong> ${record.cpf}</p>
                <p><strong>Cargo:</strong> ${record.position}</p>
                ${specificInfo}
            </div>
        `;
        recordModal.classList.remove('hidden');
        recordModal.classList.add('flex');

        document.getElementById('close-modal').addEventListener('click', () => {
            recordModal.classList.remove('flex');
            recordModal.classList.add('hidden');
        });
    };

    const initiateTermination = (id) => {
        const record = records.find(r => r.id === id);
        if (!record) return;

        recordToDemitIdInput.value = id;
        document.getElementById('full-name').value = record.fullName;
        document.getElementById('cpf').value = record.cpf;
        document.getElementById('position').value = record.position;

        form.scrollIntoView({ behavior: 'smooth' });
        processTypeSelect.value = 'demissao';
        admissaoSection.classList.remove('active');
        demissaoSection.classList.add('active');

        showMessage(`Formulário de demissão preenchido para ${record.fullName}.`);
    };

    const renderRecords = () => {
        let list = filter === 'demitidos' ? records.filter(r => r.type === 'demissao') : records;
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) list = list.filter(r => r.fullName.toLowerCase().includes(searchTerm));

        recordsList.innerHTML = '';
        if (list.length === 0) {
            noRecordsMessage.style.display = 'block';
        } else {
            noRecordsMessage.style.display = 'none';
            list.forEach(record => {
                const recordElement = document.createElement('div');
                recordElement.className = 'border p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition duration-200';

                const badgeColor = record.type === 'admissao' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
                const dateLabel = record.type === 'admissao' ? 'Data de Admissão' : 'Data de Demissão';
                const dateValue = record.type === 'admissao' ? formatDate(record.admissionDate) : formatDate(record.terminationDate);

                recordElement.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="flex items-center">
                                <h3 class="font-bold text-lg text-gray-800">${record.fullName}</h3>
                                <span class="ml-2 text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${badgeColor}">${record.type}</span>
                            </div>
                            <p class="text-sm text-gray-500 mt-1">Cargo: ${record.position}</p>
                            <p class="text-xs text-gray-400 mt-2">${dateLabel}: ${dateValue}</p>
                        </div>
                        <div>
                            ${record.type === 'admissao' ? 
                                `<button class="terminate-btn mt-2 bg-red-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-red-600 transition duration-200">Demitir</button>` 
                                : `<button class="delete-btn mt-2 bg-gray-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-gray-700 transition duration-200">Excluir</button>`}
                        </div>
                    </div>
                `;

                recordElement.querySelector('h3').addEventListener('click', () => showRecordDetails(record));

                const terminateBtn = recordElement.querySelector('.terminate-btn');
                if (terminateBtn) {
                    terminateBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        initiateTermination(record.id);
                    });
                }

                const deleteBtn = recordElement.querySelector('.delete-btn');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        records = records.filter(r => r.id !== record.id);
                        localStorage.setItem('rhRecords', JSON.stringify(records));
                        renderRecords();
                        showMessage('Registro excluído com sucesso!');
                    });
                }

                recordsList.appendChild(recordElement);
            });
        }
    };

    processTypeSelect.addEventListener('change', (e) => {
        admissaoSection.classList.toggle('active', e.target.value === 'admissao');
        demissaoSection.classList.toggle('active', e.target.value === 'demissao');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const type = processTypeSelect.value;
        const fullName = document.getElementById('full-name').value.trim();
        const cpf = document.getElementById('cpf').value.trim();
        const position = document.getElementById('position').value.trim();

        if (!fullName || !cpf || !position) {
            showMessage('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        let newRecord = {};
        if (type === 'admissao') {
            const admissionDate = document.getElementById('admission-date').value;
            const salary = document.getElementById('salary').value;

            if (!admissionDate || !salary) {
                showMessage('Por favor, preencha todos os campos obrigatórios para admissão.');
                return;
            }

            newRecord = { id: Date.now(), type, fullName, cpf, position, admissionDate, salary };
        } else {
            const terminationDate = document.getElementById('termination-date').value;
            const terminationReason = document.getElementById('termination-reason').value;

            if (!terminationDate || !terminationReason) {
                showMessage('Por favor, preencha todos os campos obrigatórios para demissão.');
                return;
            }

            const recordToDemitId = recordToDemitIdInput.value;
            const originalRecord = records.find(r => r.id === parseInt(recordToDemitId));

            if (!originalRecord) {
                showMessage('Erro: registro original não encontrado.');
                return;
            }

            newRecord = {
                id: Date.now(),
                type,
                fullName: originalRecord.fullName,
                cpf: originalRecord.cpf,
                position: originalRecord.position,
                terminationDate,
                terminationReason,
                admissionDate: originalRecord.admissionDate,
                salary: originalRecord.salary
            };

            records = records.filter(r => r.id !== parseInt(recordToDemitId));
            recordToDemitIdInput.value = '';
        }

        records.push(newRecord);
        localStorage.setItem('rhRecords', JSON.stringify(records));

        form.reset();
        processTypeSelect.value = 'admissao';
        admissaoSection.classList.add('active');
        demissaoSection.classList.remove('active');
        renderRecords();
        showMessage('Registro salvo com sucesso!');
    });

    searchInput.addEventListener('input', renderRecords);
    showAllBtn.addEventListener('click', () => { filter = 'all'; renderRecords(); });
    showDemitidosBtn.addEventListener('click', () => { filter = 'demitidos'; renderRecords(); });

    renderRecords();
});
