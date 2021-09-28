const taskList = document.getElementById('taskList');
const backlogContainer = document.querySelector('.backlog__content');
const Mask = 'task_';
const dateContainer = document.querySelector('.dateContainer');
let dataCounter = 0;
const secondsInWeek = 604800;
let isLoading = true;

function showLoader(loading) {
    if(loading) {
        document.querySelector('.content').style.display = 'none';
        document.querySelector('.backlog').style.display = 'none';
        document.querySelector('.loader').style.display = 'flex';
        document.querySelectorAll('.arrow').forEach(el => {
            el.setAttribute('disabled', 'disabled');
        });
    } else {
        document.querySelector('.content').style.display = 'block';
        document.querySelector('.backlog').style.display = 'block';
        document.querySelector('.loader').style.display = 'none';
        document.querySelectorAll('.arrow').forEach(el => {
            el.removeAttribute('disabled');
        });
    }
}

function calcDate(date) {
    let calculatedDate;
    
    if(dataCounter >= 0) {
        calculatedDate = dateToTimestamp(date) + (dataCounter * secondsInWeek)
        console.log(dataCounter, secondsInWeek, dateToTimestamp(date))
        return toDate(calculatedDate)
    } else {
        calculatedDate = dateToTimestamp(date) - (dataCounter * secondsInWeek)
        return toDate(calculatedDate)
    }
}

function createFromToDates() {
    document.querySelectorAll('.dateContainer__date').forEach(el => el.remove());
    let fromDate = document.createElement('div');
    fromDate.classList.add('dateContainer__date');
    fromDate.innerText = `${calcDate('2021-09-27')} —`;

    let toDate = document.createElement('div');
    toDate.classList.add('dateContainer__date');
    toDate.innerText = calcDate('2021-10-03');

    dateContainer.append(fromDate, toDate);
}

async function createTable(counter) {
    try {
        showLoader(true);
        const responseUsers = await fetch('https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users', {
            method: 'GET',
        });
        const responseTasks = await fetch('https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks', {
            method: 'GET',
        });
        const resUsers = await responseUsers.json();
        const resTasks = await responseTasks.json();
        let rowElement;
        createFromToDates();

        resUsers.forEach((user, index) => {
            rowElement = document.createElement("div");
            rowElement.classList.add('content__dateRow', 'row', 'row-for-remove');
            rowElement.setAttribute('data-rowid', user.id);
            
            rowElement.innerHTML = `
                <div class='content__taskItem content__taskItem_user taskItem' data-itemid='${user.id}'
                ondragover="onDragOver(event);" ondrop="onDrop(event);">${user.surname} ${user.firstName}</div>
                <div class='content__taskItem taskItem taskItem_editable' data-rowid='${user.id}' data-colid='${calcDate('2021-09-27')}'
                data-timeinsec='${dateToTimestamp('2021-09-27')}' ondragover="onDragOver(event);" ondrop="onDrop(event);"></div>
                <div class='content__taskItem taskItem taskItem_editable' data-rowid='${user.id}' data-colid='${calcDate('2021-09-28')}'
                data-timeinsec='${dateToTimestamp('2021-09-27')}' ondragover="onDragOver(event);" ondrop="onDrop(event);"></div>
                <div class='content__taskItem taskItem taskItem_editable' data-rowid='${user.id}' data-colid='${calcDate('2021-09-29')}'
                data-timeinsec='${dateToTimestamp('2021-09-27')}' ondragover="onDragOver(event);" ondrop="onDrop(event);"></div>
                <div class='content__taskItem taskItem taskItem_editable' data-rowid='${user.id}' data-colid='${calcDate('2021-09-30')}'
                data-timeinsec='${dateToTimestamp('2021-09-27')}' ondragover="onDragOver(event);" ondrop="onDrop(event);"></div>
                <div class='content__taskItem taskItem taskItem_editable' data-rowid='${user.id}' data-colid='${calcDate('2021-10-01')}'
                data-timeinsec='${dateToTimestamp('2021-09-27')}' ondragover="onDragOver(event);" ondrop="onDrop(event);"></div>
                <div class='content__taskItem taskItem taskItem_editable' data-rowid='${user.id}' data-colid='${calcDate('2021-10-02')}'
                data-timeinsec='${dateToTimestamp('2021-09-27')}' ondragover="onDragOver(event);" ondrop="onDrop(event);"></div>
                <div class='content__taskItem taskItem taskItem_editable' data-rowid='${user.id}' data-colid='${calcDate('2021-10-03')}'
                data-timeinsec='${dateToTimestamp('2021-09-27')}' ondragover="onDragOver(event);" ondrop="onDrop(event);"></div>
            `;
            taskList.append(rowElement);
        });
        let text = '';
        let taskid;
        let elNotWork;
        let elAssignedTask;
        resUsers.forEach(user => {
            let el;
            resTasks.forEach(task => {
                if(task.executor != null) {
                    el = document.querySelector(`[data-rowid="${task.executor}"][data-colid="${task.planStartDate}"]`)
                    if(el != null) {
                        el.innerText = task.subject;
                        if(task.planStartDate != null && task.planEndDate != null) {
                            el.setAttribute('data-title',
                            `Дата начала: ${task.planStartDate}
                            Дата окончания: ${task.planEndDate}`
                            )
                        }
                    }
                    
                } else {
                    text = task.subject;
                    taskid = task.id;
                    if(localStorage.getItem('taskAssigned') != null && localStorage.getItem('taskAssigned') != true) {
                        const assignedTask = JSON.parse(localStorage.getItem('assignedTask_1'));
                        elAssignedTask = document.querySelector(`[data-rowid="${assignedTask.userId}"][data-colid="${assignedTask.columnId}"]`);
                        if(elAssignedTask != null) {
                            elAssignedTask.setAttribute('data-title',
                            `Дата начала: ${task.planStartDate}
                            Дата окончания: ${task.planEndDate}`
                            );
                            elAssignedTask.innerText = task.subject;
                        }
                    }
                }
            });
        })
        
        backlogContainer.innerHTML = "";
        resTasks.forEach((task, index) => {
            let user = document.querySelector(`.row[data-rowid='${task.executor}']`);

            if(user == null && localStorage.getItem('taskAssigned') == null && localStorage.getItem('taskAssigned') != false) {
                
                elNotWork = document.createElement("div");
                elNotWork.classList.add('taskItem', 'taskItem_editable');
                elNotWork.setAttribute('id', taskid);
                elNotWork.setAttribute('draggable', true);
                elNotWork.setAttribute('data-id', taskid);
                elNotWork.setAttribute('ondragstart', "onDragStart(event)");
                elNotWork.setAttribute('data-colid', task.planStartDate);
                elNotWork.setAttribute('data-taskEndDate', task.planEndDate);
                elNotWork.innerText = text;
                backlogContainer.append(elNotWork)
            }
        })
        isLoading = false;
        showLoader(false);
    } catch (error) {
        showLoader(true);
        isLoading = true;
        console.error(error);
    }
}
createTable(dataCounter);

function cleanTable() {
    isLoading = true;
    document.querySelectorAll('.row-for-remove').forEach(el => {
        el.remove();
    });
}

document.getElementById('toLeft').addEventListener('click', function (e) {
    dataCounter--;
    cleanTable();

    createTable(dataCounter);
})

document.getElementById('toRight').addEventListener('click', function (e) {
    dataCounter++;
    cleanTable();

    createTable(dataCounter);
})

function onDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.dataset.id);
}

function onDragOver(event) {
    event.preventDefault();
    if(event.stopPropagation) { event.stopPropagation(); }
}

function onDrop(event) {
    event.preventDefault();
    const id = event.dataTransfer.getData('text');
    const draggableElement = document.getElementById(id);
    let dropzone = event.target;
    if(!event.target.classList.contains('content__taskItem_user')) {
        dropzone.append(draggableElement);
        dropzone.setAttribute('data-title', 
            `Дата начала: ${dropzone.dataset.colid}
            Дата окончания: ${draggableElement.dataset.taskenddate}`);
        
        let obj = {
            id: `assignedTask_1`,
            subject: event.currentTarget.innerText,
            columnId: event.target.dataset.colid,
            userId: event.target.dataset.rowid
        };

        localStorage.setItem('assignedTask_1', JSON.stringify(obj));
        localStorage.setItem('taskAssigned', true);
    } else {
        dropzone = document.querySelector(`[data-rowid='${event.target.dataset.itemid}'][data-colid='${draggableElement.dataset.colid}']`);
        if(dropzone == null) {
            let obj = {
                id: `assignedTask_1`,
                subject: event.currentTarget.innerText,
                columnId: draggableElement.dataset.colid,
                userId: event.target.dataset.itemid
            };
            
            draggableElement.remove();
            localStorage.setItem('assignedTask_1', JSON.stringify(obj));
            localStorage.setItem('taskAssigned', true);
        } else {
            console.log(dropzone, draggableElement.dataset.colid, draggableElement.dataset.taskenddate);
            dropzone.setAttribute('data-title', 
            `Дата начала: ${draggableElement.dataset.colid}
            Дата окончания: ${draggableElement.dataset.taskenddate}`);
            dropzone.append(draggableElement);
            let obj = {
                id: `assignedTask_1`,
                subject: event.currentTarget.innerText,
                columnId: draggableElement.dataset.colid,
                userId: event.target.dataset.itemid
            };
    
            localStorage.setItem('assignedTask_1', JSON.stringify(obj));
            localStorage.setItem('taskAssigned', true);
        }
        
    }
    // event
    //     .dataTransfer
    //     .clearData();
}

function dateToTimestamp(date) {
    // let formatDate = date.replace(/-/g, '.');
    return Date.parse(`${date}`) / 1000;
}

function toDate(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var year = a.getFullYear();
    var month = a.getMonth() + 1;
    if(month < 10) {
        month = '0' + month;
    }
    var date = a.getDate();
    if(date < 10) {
        date = '0' + date;
    }
    var time = year +  '-' + month + '-' + date;
    return time;
}