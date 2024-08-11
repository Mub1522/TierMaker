const $ = el => document.querySelector(el)
const $$ = el => document.querySelectorAll(el)

const imageInput = $('#add-image-btn');
const itemsSection = $('#selector-items');
const imagesItems = $('#selector-items');
const btnReset = $('#btn-reset');
const saveTier = $('#save-tier');

function createImgItem(src) {
    const imgElement = document.createElement('img');
    imgElement.src = src;
    imgElement.classList.add('image-item');

    imgElement.addEventListener('dragstart', handleDragStart);
    imgElement.addEventListener('dragend', handleDragEnd);
    imagesItems.appendChild(imgElement);
    return imgElement;
}

function useFilesToCreateItems(files) {
    if (files && files.length > 0) {
        Array.from(files).forEach(img => {
            const reader = new FileReader();

            reader.onload = (eventFile) => {
                createImgItem(eventFile.target.result);
            }

            reader.readAsDataURL(img)
        });
    }
}

imageInput.addEventListener('change', (event) => {
    const { files } = event.target
    useFilesToCreateItems(files);
});

let draggedElement = null;
let srcContainer = null;

const rows = $$('.tier .row');

rows.forEach(row => {
    row.addEventListener('drop', handleDrop);
    row.addEventListener('dragover', handleDragOver);
    row.addEventListener('dragleave', handleDragLeave);
});

/* Events */
itemsSection.addEventListener('drop', handleDrop);
itemsSection.addEventListener('dragover', handleDragOver);
itemsSection.addEventListener('dragleave', handleDragLeave);

/* Drop */
function handleDrop(event) {
    event.preventDefault();

    const { currentTarget, dataTransfer } = event;

    if (srcContainer && draggedElement) {
        srcContainer.removeChild(draggedElement);
    }

    if (draggedElement) {
        const src = dataTransfer.getData('text/plain');
        const item = createImgItem(src);
        currentTarget.appendChild(item);
    } else {
        /* Drop over desktop */
        if (dataTransfer.types.includes('Files')) {
            currentTarget.classList.remove('drag-files');
            const { files } = dataTransfer;
            useFilesToCreateItems(files)
        }
    }

    currentTarget.classList.remove('drag-over');
    currentTarget.querySelector('.preview-item')?.remove();
};
function handleDragOver(event) {
    event.preventDefault();

    const { currentTarget, dataTransfer } = event;

    if (srcContainer === currentTarget) return;

    const previewActive = $('.preview-item');

    if (draggedElement && !previewActive) {
        let previewItem = draggedElement.cloneNode(true);
        previewItem.classList.add('preview-item');
        currentTarget.appendChild(previewItem);
    } else if (!draggedElement) {
        /* Drag over desktop */
        if (dataTransfer.types.includes('Files')) {
            currentTarget.classList.add('drag-files')
        }
    }

    currentTarget.classList.add('drag-over');
};
function handleDragLeave(event) {
    event.preventDefault();

    const { currentTarget } = event;

    currentTarget.classList.remove('drag-over');

    currentTarget.querySelector('.preview-item')?.remove();
};

/* Drag */
function handleDragStart(event) {
    draggedElement = event.target;
    srcContainer = draggedElement.parentNode;
    event.dataTransfer.setData('text/plain', draggedElement.src);
}

function handleDragEnd(event) {
    draggedElement = null;
    srcContainer = null;
}

/* Reset */
btnReset.addEventListener('click', () => {
    const items = $$('.tier .image-item');
    console.log(items)
    items.forEach(item => {
        item.remove();
        itemsSection.appendChild(item);
    });
});

/* Save tier */
saveTier.addEventListener('click', () => {
    const tierContainer = $('.tier')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    import('https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.8/+esm')
        .then(({ default: html2canvas }) => {
            html2canvas(tierContainer).then(canvas => {
                ctx.drawImage(canvas, 0, 0)
                const imgURL = canvas.toDataURL('image/png')

                const downloadLink = document.createElement('a')
                downloadLink.download = 'tier.png'
                downloadLink.href = imgURL
                downloadLink.click()
            })
        })
})