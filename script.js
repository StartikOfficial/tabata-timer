const WHITE_COLOR = "#eee";

// сам таймер
var interval;

// запущен ли интервал
var intervalWorks = false;

// у каждого помодоро есть свой id
let id = 0;

// дефолт настройки
const defaultPomodoro = {
    sound: true,
    workSession: {
        hours: 0,
        minutes: 25
    },
    shortBreak: {
        hours: 0,
        minutes: 5
    },
    longBreak: {
        hours: 0,
        minutes: 15
    },
    counterCurrent: 0,
    counterAll: 4,
    work: true,
    wasStarted: false,
}

// хранение настроек для каждого помодоро
const pomodoros = {};

// Воспроизведение звуков
function doSound(command = "start") {
    var audio = new Audio();
    if (command === "start") {audio.src = "./assets/audio/timer-started.mp3"}
    else if (command === "end") {audio.src = "./assets/audio/timer-ended.mp3";}
    audio.autoplay = true;
}

// Показ настроек
function showSettings(el) {
    const parent = el.closest(".tabata");
    const settingsMenu = parent.querySelector(".settings-menu");
    if (!settingsMenu.classList.contains("none")) {
        el.style.backgroundColor = WHITE_COLOR;
        settingsMenu.classList.add("none");
        settingsMenu.classList.remove("pointer-events-auto");
        parent.classList.remove("pointer-events-none")
        checkSettings(settingsMenu);
    }
    else {
        el.style.backgroundColor = "white";
        settingsMenu.classList.remove("none");
        settingsMenu.classList.add("pointer-events-auto");
        parent.classList.add("pointer-events-none")
    };
}

// Проверка настроек и запись их в объект хранения настроек
function checkSettings(settingsMenu) {
    const tabata = settingsMenu.closest(".tabata");
    const pomodoroId = tabata.id;

    // если будут введены только часы, то минуты равны 0
    const settingsMenuInputs = settingsMenu.querySelectorAll(".settings-menu-item input");
    for (let i = 0; i < 6; i+=2) {
        if (settingsMenuInputs[i].value && !settingsMenuInputs[i+1].value) {
            settingsMenuInputs[i+1].value = "0";
        }
    }

    // создание объекта с настройками таймера
    const inputs = {
        workSession: {
            hours: settingsMenu.querySelector("#work-session-input-hours").value || defaultPomodoro.workSession.hours,
            minutes: settingsMenu.querySelector("#work-session-input-minutes").value || defaultPomodoro.workSession.minutes 
        },
        shortBreak: {
            hours: settingsMenu.querySelector("#short-break-input-hours").value || defaultPomodoro.shortBreak.hours,
            minutes: settingsMenu.querySelector("#short-break-input-minutes").value || defaultPomodoro.shortBreak.minutes
        },
        longBreak: {
            hours: settingsMenu.querySelector("#long-break-input-hours").value || defaultPomodoro.longBreak.hours,
            minutes: settingsMenu.querySelector("#long-break-input-minutes").value || defaultPomodoro.longBreak.minutes
        },
        pomodoroCount: settingsMenu.querySelector("#pomodoro-count").value || defaultPomodoro.counterAll,
    };

    // заполнение настроек этого помодоро
    pomodoros[pomodoroId].workSession = {...inputs.workSession};
    pomodoros[pomodoroId].shortBreak = {...inputs.shortBreak};
    pomodoros[pomodoroId].longBreak = {...inputs.longBreak};
    pomodoros[pomodoroId].sound = settingsMenu.querySelector("#sound-btn").checked;


    // если не был запущен помодоро, то таймер не будет изменяться, пока не закончится данный интервал
    if (!pomodoros[pomodoroId].wasStarted) {
        if (pomodoros[pomodoroId].work) {
            tabata.querySelector(".timer-hours").innerHTML = pomodoros[pomodoroId].workSession.hours || "0";
            tabata.querySelector(".timer-minutes").innerHTML = pomodoros[pomodoroId].workSession.minutes || "25";
        }
        else {
            if (pomodoros[pomodoroId].counterCurrent % 4 === 0) {
                tabata.querySelector(".timer-hours").innerHTML = pomodoros[pomodoroId].longBreak.hours || "0";
                tabata.querySelector(".timer-minutes").innerHTML = pomodoros[pomodoroId].longBreak.minutes || "15";
            }
            else {
                tabata.querySelector(".timer-hours").innerHTML = pomodoros[pomodoroId].shortBreak.hours || "0";
                tabata.querySelector(".timer-minutes").innerHTML = pomodoros[pomodoroId].shortBreak.minutes || "5";
            }

        }
    }

    normalizeTimer(tabata.querySelector(".timer-minutes"));

    // если количество всех помодоро будет меньше, чем уже пройденное количество, то настройка не изменится
    if (pomodoros[pomodoroId].counterCurrent < +inputs.pomodoroCount || (!inputs.pomodoroCount.length && 4 > pomodoros[pomodoroId].counterCurrent)) {
        tabata.querySelector(".counter-all").innerHTML = inputs.pomodoroCount || "4";
        pomodoros[pomodoroId].counterAll = inputs.pomodoroCount;
    }
}

// Валидация инпута
function validateInput(input, maxLen, maxNum = Infinity) {
    if (input.value.length > maxLen) {input.value = input.value.substring(0, maxLen);}
    if (+input.value > maxNum) {input.value = maxNum;}
}

// Работа таймера
function startTimer(command, timeInputs = null, pomodoroId = null) {
    if (command === "play") {
        if (pomodoros[pomodoroId].sound) doSound("start");
        intervalWorks = true;
        interval = setInterval(() => {
            if (+timeInputs.seconds.innerHTML === 0) {
                if (+timeInputs.minutes.innerHTML === 0) {
                    if (+timeInputs.hours.innerHTML === 0) {
                        
                        const tabata = document.getElementById(`${pomodoroId}`);

                        if (pomodoros[pomodoroId].work) {

                            document.getElementById(`${pomodoroId}`).querySelector(".current-state-work").classList.add("none");
                            pomodoros[pomodoroId].counterCurrent += 1;
                            document.getElementById(`${pomodoroId}`).querySelector(".counter-current").innerHTML = pomodoros[pomodoroId].counterCurrent;

                            if (pomodoros[pomodoroId].counterCurrent % 4 === 0) {
                                resetTimeInputs(timeInputs, pomodoroId, "longBreak");

                                document.getElementById(`${pomodoroId}`).querySelector(".current-state-long-break").classList.remove("none");
                            }
                            else {
                                resetTimeInputs(timeInputs, pomodoroId, "shortBreak");

                                document.getElementById(`${pomodoroId}`).querySelector(".current-state-short-break").classList.remove("none");
                            }
                        }
                        else {
                            document.getElementById(`${pomodoroId}`).querySelector(".current-state-short-break").classList.add("none");
                            document.getElementById(`${pomodoroId}`).querySelector(".current-state-long-break").classList.add("none");
                            document.getElementById(`${pomodoroId}`).querySelector(".current-state-work").classList.remove("none");

                            resetTimeInputs(timeInputs, pomodoroId, "workSession");
                        }

                        pomodoros[pomodoroId].work = !pomodoros[pomodoroId].work
                        clearInterval(interval);
                        intervalWorks = false;
                        pomodoros[pomodoroId].wasStarted = false;

                        if (document.getElementById(`${pomodoroId}`).querySelector("#automate-timer-btn").checked) {
                            return startTimer("play", timeInputs, pomodoroId);
                        }
                        else {
                            if (pomodoros[pomodoroId].sound) {doSound("end");}
                            tabata.querySelector(".control-pause").classList.add("none");
                            tabata.querySelector(".control-play").classList.remove("none");
                            tabata.querySelector(".control-skip").classList.add("none");

                            return startTimer("pause")
                        }
                        

                    }
                    else {
                        timeInputs.seconds.innerHTML = 59
                        timeInputs.minutes.innerHTML = 59;
                        timeInputs.hours.innerHTML = +timeInputs.hours.innerHTML - 1;
                    }
                }
                else {
                    timeInputs.seconds.innerHTML = 59;
                    if ((+timeInputs.minutes.innerHTML - 1) < 10)
                        timeInputs.minutes.innerHTML = "0" + (+timeInputs.minutes.innerHTML - 1)
                    else
                        timeInputs.minutes.innerHTML = +timeInputs.minutes.innerHTML - 1;
                }
            }
            else {
                if ((+timeInputs.seconds.innerHTML - 1) < 10)
                    timeInputs.seconds.innerHTML = "0" + (+timeInputs.seconds.innerHTML - 1)
                else
                    timeInputs.seconds.innerHTML = +timeInputs.seconds.innerHTML - 1;
            }
        }, 1000);
    }
    else if (command === "pause") {
        clearInterval(interval);
        intervalWorks = false;
    }
}

// Добавление помодоро
function addPomodoro() {
    const div = document.createElement("div");
    const addBtn = document.querySelector(".add-btn");
    addBtn.before(div);
    div.setAttribute('class', "tabata");
    div.setAttribute('id', `${id}`);
    div.innerHTML = `
<div class="current-state">
    <span class="current-state-work">Работа</span>
    <span class="current-state-short-break none">Короткий перерыв</span>
    <span class="current-state-long-break none">Длинный перерыв</span>
</div>
<div class="settings pointer-events-auto" onclick="showSettings(this)">
    <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="Interface / Settings">
            <g id="Vector">
                <path d="M20.3499 8.92293L19.9837 8.7192C19.9269 8.68756 19.8989 8.67169 19.8714 8.65524C19.5983 8.49165 19.3682 8.26564 19.2002 7.99523C19.1833 7.96802 19.1674 7.93949 19.1348 7.8831C19.1023 7.82677 19.0858 7.79823 19.0706 7.76998C18.92 7.48866 18.8385 7.17515 18.8336 6.85606C18.8331 6.82398 18.8332 6.79121 18.8343 6.72604L18.8415 6.30078C18.8529 5.62025 18.8587 5.27894 18.763 4.97262C18.6781 4.70053 18.536 4.44993 18.3462 4.23725C18.1317 3.99685 17.8347 3.82534 17.2402 3.48276L16.7464 3.1982C16.1536 2.85658 15.8571 2.68571 15.5423 2.62057C15.2639 2.56294 14.9765 2.56561 14.6991 2.62789C14.3859 2.69819 14.0931 2.87351 13.5079 3.22396L13.5045 3.22555L13.1507 3.43741C13.0948 3.47091 13.0665 3.48779 13.0384 3.50338C12.7601 3.6581 12.4495 3.74365 12.1312 3.75387C12.0992 3.7549 12.0665 3.7549 12.0013 3.7549C11.9365 3.7549 11.9024 3.7549 11.8704 3.75387C11.5515 3.74361 11.2402 3.65759 10.9615 3.50224C10.9334 3.48658 10.9056 3.46956 10.8496 3.4359L10.4935 3.22213C9.90422 2.86836 9.60915 2.69121 9.29427 2.62057C9.0157 2.55807 8.72737 2.55634 8.44791 2.61471C8.13236 2.68062 7.83577 2.85276 7.24258 3.19703L7.23994 3.1982L6.75228 3.48124L6.74688 3.48454C6.15904 3.82572 5.86441 3.99672 5.6517 4.23614C5.46294 4.4486 5.32185 4.69881 5.2374 4.97018C5.14194 5.27691 5.14703 5.61896 5.15853 6.3027L5.16568 6.72736C5.16676 6.79166 5.16864 6.82362 5.16817 6.85525C5.16343 7.17499 5.08086 7.48914 4.92974 7.77096C4.9148 7.79883 4.8987 7.8267 4.86654 7.88237C4.83436 7.93809 4.81877 7.96579 4.80209 7.99268C4.63336 8.26452 4.40214 8.49186 4.12733 8.65572C4.10015 8.67193 4.0715 8.68752 4.01521 8.71871L3.65365 8.91908C3.05208 9.25245 2.75137 9.41928 2.53256 9.65669C2.33898 9.86672 2.19275 10.1158 2.10349 10.3872C2.00259 10.6939 2.00267 11.0378 2.00424 11.7255L2.00551 12.2877C2.00706 12.9708 2.00919 13.3122 2.11032 13.6168C2.19979 13.8863 2.34495 14.134 2.53744 14.3427C2.75502 14.5787 3.05274 14.7445 3.64974 15.0766L4.00808 15.276C4.06907 15.3099 4.09976 15.3266 4.12917 15.3444C4.40148 15.5083 4.63089 15.735 4.79818 16.0053C4.81625 16.0345 4.8336 16.0648 4.8683 16.1255C4.90256 16.1853 4.92009 16.2152 4.93594 16.2452C5.08261 16.5229 5.16114 16.8315 5.16649 17.1455C5.16707 17.1794 5.16658 17.2137 5.16541 17.2827L5.15853 17.6902C5.14695 18.3763 5.1419 18.7197 5.23792 19.0273C5.32287 19.2994 5.46484 19.55 5.65463 19.7627C5.86915 20.0031 6.16655 20.1745 6.76107 20.5171L7.25478 20.8015C7.84763 21.1432 8.14395 21.3138 8.45869 21.379C8.73714 21.4366 9.02464 21.4344 9.30209 21.3721C9.61567 21.3017 9.90948 21.1258 10.4964 20.7743L10.8502 20.5625C10.9062 20.5289 10.9346 20.5121 10.9626 20.4965C11.2409 20.3418 11.5512 20.2558 11.8695 20.2456C11.9015 20.2446 11.9342 20.2446 11.9994 20.2446C12.0648 20.2446 12.0974 20.2446 12.1295 20.2456C12.4484 20.2559 12.7607 20.3422 13.0394 20.4975C13.0639 20.5112 13.0885 20.526 13.1316 20.5519L13.5078 20.7777C14.0971 21.1315 14.3916 21.3081 14.7065 21.3788C14.985 21.4413 15.2736 21.4438 15.5531 21.3855C15.8685 21.3196 16.1657 21.1471 16.7586 20.803L17.2536 20.5157C17.8418 20.1743 18.1367 20.0031 18.3495 19.7636C18.5383 19.5512 18.6796 19.3011 18.764 19.0297C18.8588 18.7252 18.8531 18.3858 18.8417 17.7119L18.8343 17.2724C18.8332 17.2081 18.8331 17.1761 18.8336 17.1445C18.8383 16.8247 18.9195 16.5104 19.0706 16.2286C19.0856 16.2007 19.1018 16.1726 19.1338 16.1171C19.166 16.0615 19.1827 16.0337 19.1994 16.0068C19.3681 15.7349 19.5995 15.5074 19.8744 15.3435C19.9012 15.3275 19.9289 15.3122 19.9838 15.2818L19.9857 15.2809L20.3472 15.0805C20.9488 14.7472 21.2501 14.5801 21.4689 14.3427C21.6625 14.1327 21.8085 13.8839 21.8978 13.6126C21.9981 13.3077 21.9973 12.9658 21.9958 12.2861L21.9945 11.7119C21.9929 11.0287 21.9921 10.6874 21.891 10.3828C21.8015 10.1133 21.6555 9.86561 21.463 9.65685C21.2457 9.42111 20.9475 9.25526 20.3517 8.92378L20.3499 8.92293Z" stroke="#000000" stroke-width="0" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8.00033 12C8.00033 14.2091 9.79119 16 12.0003 16C14.2095 16 16.0003 14.2091 16.0003 12C16.0003 9.79082 14.2095 7.99996 12.0003 7.99996C9.79119 7.99996 8.00033 9.79082 8.00033 12Z" stroke="#000000" stroke-width="0" stroke-linecap="round" stroke-linejoin="round" fill="#eee"/>
            </g>
        </g>
    </svg>
</div>
<div class="task-complete" onclick="completeTheTask(this)">
    <svg fill="#000000" width="800px" height="800px" viewBox="0 0 24 24" 
        id="check-mark-circle-2" data-name="Flat Line" xmlns="http://www.w3.org/2000/svg" 
        class="icon flat-line">
        <polyline id="primary" points="21 5 12 14 8 10" 
            style="fill: none; stroke: #52C834; stroke-linecap: round; stroke-linejoin: round; stroke-width: 3;">
        </polyline>
        <path id="primary-2" data-name="primary" 
            d="M20.94,11A8.26,8.26,0,0,1,21,12a9,9,0,1,1-9-9,8.83,8.83,0,0,1,4,1" 
            style="fill: none; stroke: #52C834; stroke-linecap: round; 
            stroke-linejoin: round; stroke-width: 2;">
        </path>
    </svg>
    
    <svg width="800px" height="800px" viewBox="0 0 24 24" role="img" 
        xmlns="http://www.w3.org/2000/svg" aria-labelledby="cancelIconTitle" stroke="#000000" class="none"
        stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" color="#000000"> 
        <title id="cancelIconTitle">Cancel</title> 
        <path d="M15.5355339 15.5355339L8.46446609 8.46446609M15.5355339 8.46446609L8.46446609 15.5355339"/> 
        <path d="M4.92893219,19.0710678 C1.02368927,15.1658249 1.02368927,8.83417511 
        4.92893219,4.92893219 C8.83417511,1.02368927 15.1658249,1.02368927 19.0710678,4.92893219 
        C22.9763107,8.83417511 22.9763107,15.1658249 19.0710678,19.0710678 C15.1658249,22.9763107 
        8.83417511,22.9763107 4.92893219,19.0710678 Z"/> 
    </svg>
</div>
<div class="settings-menu flex-column none">
    <h2>Настройки</h2>
    <div class="settings-menu-general-settings flex-column">
        <div class="sound">
            <span>Звук</span>
            <input type="checkbox" name="sound-btn" id="sound-btn" checked>
        </div>
        <div class="automate-timer">
            <span>Беспрерывный таймер</span>
            <input type="checkbox" name="automate-timer-btn" id="automate-timer-btn" checked>
        </div>
    </div>
    <h2>Таймер</h2>
    <div class="settings-menu-timer-settings flex-column">
        <div class="work-session">
            <span>Время работы</span>
            <div class="settings-menu-item">
                <input type="number" oninput="validateInput(this, 2)" placeholder="0" name="work-session-input-hours" id="work-session-input-hours" maxlength="2" step="1" min="0">
                <span>ч</span>
                <input type="number" oninput="validateInput(this, 2, 59)" placeholder="25" name="work-session-input-minutes" id="work-session-input-minutes" maxlength="2" step="1" min="0" max="60">
                <span>мин</span>
            </div>
        </div>
        <div class="short-break">
            <span>Короткий перерыв</span>
            <div class="settings-menu-item">
                <input type="number" oninput="validateInput(this, 2)" placeholder="0" name="short-break-input-hours" id="short-break-input-hours" maxlength="2" step="1" min="0">
                <span>ч</span>
                <input type="number" oninput="validateInput(this, 2, 59)" placeholder="5" name="short-break-input-minutes" id="short-break-input-minutes" maxlength="2" step="1" min="0" max="60">
                <span>мин</span>
            </div>
        </div>
        <div class="long-break">
            <span>Длинный перерыв</span>
            <div class="settings-menu-item">
                <input type="number" oninput="validateInput(this, 2)" placeholder="0" name="long-break-input-hours" id="long-break-input-hours" maxlength="2" step="1" min="0">
                <span>ч</span>
                <input type="number" oninput="validateInput(this, 2, 59)" placeholder="15" name="long-break-input-minutes" id="long-break-input-minutes" maxlength="2" step="1" min="0" max="60">
                <span>мин</span>
            </div>
        </div>
        <div class="pomodoro-count">
            <span>Количество помодоро</span>
            <div class="settings-menu-item">
                <input type="number" oninput="validateInput(this, 3)" placeholder="4" name="pomodoro-count" id="pomodoro-count" maxlength="3" step="1" min="1">
            </div>
        </div>
    </div>
    <div class="settings-menu-delete-pomodoro" onclick="deletePomodoro(this)">
        Удалить этот помодоро
    </div>
</div>
<div class="tabata-container flex-column">
    <div class="timer flex-column">
        <span class="timer-hours">0</span>
        <div class="flex-center">
            <span class="timer-minutes">25</span>
            :
            <span class="timer-seconds">00</span>
        </div>
    </div>
    <div class="task">
        <textarea rows="3" name="" id="" placeholder="Название задачи" maxlength="50" ></textarea>
    </div>
    
    <div class="counter flex-column">
        <div>
            <span class="counter-current">0</span>
            /
            <span class="counter-all">4</span>
        </div>
        <span>Помодоро</span>
    </div>
    <div class="control flex-row">
        <div class="control-pause none" onclick="pausePomodoro(this)">
            <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M9 7C9 6.44772 8.55228 6 8 6C7.44772 6 7 6.44772 7 7V17C7 17.5523 7.44772 18 8 18C8.55228 18 9 17.5523 9 17V7ZM17 7C17 6.44772 16.5523 6 16 6C15.4477 6 15 6.44772 15 7V17C15 17.5523 15.4477 18 16 18C16.5523 18 17 17.5523 17 17V7Z"/>
            </svg>
        </div>
        <div class="control-play" onclick="playPomodoro(this)">
            <svg width="800px" height="800px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.92 24.096q0 1.088 0.928 1.728 0.512 0.288 1.088 0.288 0.448 0 0.896-0.224l16.16-8.064q0.48-0.256 0.8-0.736t0.288-1.088-0.288-1.056-0.8-0.736l-16.16-8.064q-0.448-0.224-0.896-0.224-0.544 0-1.088 0.288-0.928 0.608-0.928 1.728v16.16z"></path>
            </svg>
        </div>
        <div class="control-reset" onclick="resetPomodoro(this)">
            <svg width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="none" stroke-width="2" d="M20,8 C18.5974037,5.04031171 15.536972,3 12,3 C7.02943725,3 3,7.02943725 3,12 C3,16.9705627 7.02943725,21 12,21 L12,21 C16.9705627,21 21,16.9705627 21,12 M21,3 L21,9 L15,9"/>
            </svg>
        </div>
        <div class="control-skip none" onclick="skipPomodoro(this)">
            <svg width="800px" height="800px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" class="bi bi-skip-forward-fill">
                <path d="M15.5 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V8.753l-6.267 3.636c-.54.313-1.233-.066-1.233-.697v-2.94l-6.267 3.636C.693 12.703 0 12.324 0 11.693V4.308c0-.63.693-1.01 1.233-.696L7.5 7.248v-2.94c0-.63.693-1.01 1.233-.696L15 7.248V4a.5.5 0 0 1 .5-.5z"/>
            </svg>
        </div>
    </div>
</div>
<span class="task-complete-text none">
    ВЫПОЛНЕНО
</span>
`

    pomodoros[id] = { ...defaultPomodoro };
    id += 1;
}

// Удаление помодоро
function deletePomodoro(el) {
    const tabata = el.closest('.tabata');
    delete pomodoros[tabata.id];
    tabata.remove();
}

// Начать работу таймера
function playPomodoro(play) {

    if (intervalWorks) return alert("Поставьте на паузу другой помодоро, чтобы запустить этот.")
    const tabata = play.closest(".tabata")
    const pomodoroId = tabata.id;

    // помодоро начал работу
    pomodoros[pomodoroId].wasStarted = true;

    const pause = tabata.querySelector(".control-pause");
    const skip = tabata.querySelector(".control-skip");
    pause.classList.remove("none");
    skip.classList.remove("none");
    play.classList.add("none");

    let timeInputs = {};
    const timer = tabata.querySelector(".timer");
    timeInputs.hours = timer.querySelector(".timer-hours");
    timeInputs.minutes = timer.querySelector(".timer-minutes");
    timeInputs.seconds = timer.querySelector(".timer-seconds");

    startTimer("play", timeInputs, pomodoroId);
}

// Остановить работу таймера
function pausePomodoro(pause) {
    const parent = pause.closest(".tabata");

    const play = parent.querySelector(".control-play");
    const skip = parent.querySelector(".control-skip");
    pause.classList.add("none");
    skip.classList.add("none");
    play.classList.remove("none");

    startTimer("pause");
}

// Сбросить таймер в текущем состоянии (работа, перерыв)
function resetPomodoro(reset) {
    const tabata = reset.closest(".tabata");
    const pomodoroId = tabata.id;


    pausePomodoro(tabata.querySelector(".control-pause"));

    const timeInputs = {
        hours: tabata.querySelector(".timer-hours"),
        minutes: tabata.querySelector(".timer-minutes"),
        seconds: tabata.querySelector(".timer-seconds")
    }

    const currentState = tabata.querySelector(".current-state span:not(.none)").classList[0];
    
    if (currentState === "current-state-work") {
        resetTimeInputs(timeInputs, pomodoroId, "workSession");
    }
    else if (currentState === "current-state-short-break") {
        resetTimeInputs(timeInputs, pomodoroId, "shortBreak");
    }
    else {
        resetTimeInputs(timeInputs, pomodoroId, "longBreak");
    }

    normalizeTimer(timeInputs.minutes);
}

// Пропустить шаг помодоро
function skipPomodoro(el) {
    const tabata = el.closest(".tabata");
    const pomodoroId = tabata.id;
    const timeInputs = {
        hours: tabata.querySelector(".timer-hours"),
        minutes: tabata.querySelector(".timer-minutes"),
        seconds: tabata.querySelector(".timer-seconds")
    }
    if (pomodoros[pomodoroId].work) {

        tabata.querySelector(".current-state-work").classList.add("none");

        pomodoros[pomodoroId].counterCurrent += 1;
        tabata.querySelector(".counter-current").innerHTML = pomodoros[pomodoroId].counterCurrent;

        if (pomodoros[pomodoroId].counterCurrent % 4 === 0) {
            resetTimeInputs(timeInputs, pomodoroId, "longBreak");

            tabata.querySelector(".current-state-long-break").classList.remove("none");
        }
        else {
            resetTimeInputs(timeInputs, pomodoroId, "shortBreak");

            tabata.querySelector(".current-state-short-break").classList.remove("none");
        }
    }
    else {
        resetTimeInputs(timeInputs, pomodoroId, "workSession");

        tabata.querySelector(".current-state-short-break").classList.add("none");
        tabata.querySelector(".current-state-long-break").classList.add("none");
        tabata.querySelector(".current-state-work").classList.remove("none");
    }

    normalizeTimer(timeInputs.minutes);

    pomodoros[pomodoroId].work = !pomodoros[pomodoroId].work;
    pomodoros[pomodoroId].wasStarted = false;

    return pausePomodoro(tabata.querySelector(".control-pause"));

}

// Добавление 0 перед минутами/секундами для красоты
function normalizeTimer(timerUnit) {
    if ((+timerUnit.innerHTML) < 10) {
        timerUnit.innerHTML = "0" + (+timerUnit.innerHTML);
    }
    else {
        timerUnit.innerHTML = +timerUnit.innerHTML;
    }
}

// Вспомогательная функция для сброса времени на таймере, чтобы не писать одинаковый код
function resetTimeInputs(timeInputs, pomodoroId, state) {
    timeInputs.hours.innerHTML = pomodoros[pomodoroId][state].hours || "0";
    timeInputs.minutes.innerHTML = pomodoros[pomodoroId][state].minutes || "00";
    timeInputs.seconds.innerHTML = "00";
};

function completeTheTask(el) {
    const tabata = el.closest(".tabata");
    const tabataDivs = tabata.children;
    const control = tabata.querySelector(".control");
    
    pausePomodoro(tabata.querySelector(".control-pause"));

    tabataDivs[5].classList.toggle("none");
    control.classList.toggle("visability-hidden");

    for (let i = 0; i < 5; i++) {
        if (i < 2) {
            tabataDivs[2].querySelectorAll("svg")[i].classList.toggle("none");
        }
        else if (i === 2) {
            tabataDivs[2].classList.toggle("task-complete-active");
            continue;
        }
        tabataDivs[i].classList.toggle("dark-and-events-none");
    }
}