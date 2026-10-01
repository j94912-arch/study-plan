/* ==================================================
   基本設定
================================================== */

const subjects = [
  "中會",
  "高會",
  "管會",
  "審計",
  "稅法",
  "公司法",
  "證交法",
  "商會法"
];


const startDate =
  new Date(2026, 10, 16);


const endDate =
  new Date(2027, 7, 31);


const weekNames = [
  "日",
  "一",
  "二",
  "三",
  "四",
  "五",
  "六"
];


/* ==================================================
   日期
================================================== */

const dates = [];

let currentDate =
  new Date(startDate);


while (currentDate <= endDate) {

  dates.push(
    new Date(currentDate)
  );

  currentDate.setDate(
    currentDate.getDate() + 1
  );
}


/* ==================================================
   日期轉換
================================================== */

function getDateKey(date) {

  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");


  const day =
    String(
      date.getDate()
    ).padStart(2, "0");


  return `${year}-${month}-${day}`;
}


/* ==================================================
   日期顯示
================================================== */

function formatDisplayDate(
  dateString
) {

  const parts =
    dateString.split("-");


  if (parts.length !== 3) {
    return dateString;
  }


  return (
    `${Number(parts[1])}/${Number(parts[2])}`
  );
}


/* ==================================================
   上方排程資料
================================================== */

let studyData =
  JSON.parse(
    localStorage.getItem(
      "studyPlanData"
    )
  ) || {};


/* ==================================================
   下方紀錄資料

   結構：

   {
      中會_2026-11-16: "內容",
      中會_2026-11-17: "內容",
      高會_2026-11-16: "內容"
   }
================================================== */

let recordData =
  JSON.parse(
    localStorage.getItem(
      "studyRecordData"
    )
  ) || {};


/* ==================================================
   建立上方日期
================================================== */

const dateRow =
  document.getElementById(
    "dateRow"
  );


dates.forEach(date => {

  const th =
    document.createElement("th");


  const month =
    date.getMonth() + 1;


  const day =
    date.getDate();


  const week =
    weekNames[
      date.getDay()
    ];


  th.innerHTML = `

    <div class="date">
      ${month}/${day}
    </div>

    <div class="week">
      (${week})
    </div>

  `;


  dateRow.appendChild(th);
});


/* ==================================================
   上方最後一欄
================================================== */

const countHeader =
  document.createElement("th");


countHeader.className =
  "count-header";


countHeader.innerHTML =
  "確實<br>上課";


dateRow.appendChild(
  countHeader
);


/* ==================================================
   建立上方科目
================================================== */

const tableBody =
  document.getElementById(
    "tableBody"
  );


subjects.forEach(
  (subject, subjectIndex) => {

    const row =
      document.createElement("tr");


    /* 科目 */

    const subjectCell =
      document.createElement("td");


    subjectCell.className =
      "subject";


    subjectCell.textContent =
      subject;


    row.appendChild(
      subjectCell
    );


    /* 每一天 */

    dates.forEach(date => {

      const cell =
        document.createElement("td");


      cell.className =
        `study-cell subject-${subjectIndex}`;


      const square =
        document.createElement("div");


      square.className =
        "study-square";


      cell.appendChild(
        square
      );


      const dateKey =
        getDateKey(date);


      const key =
        `${subject}_${dateKey}`;


      if (studyData[key]) {

        cell.classList.add(
          studyData[key]
        );
      }


      let pressTimer = null;

      let longPressed = false;


      /* ==============================
         長按
      ============================== */

      function startPress() {

        longPressed = false;


        pressTimer =
          setTimeout(() => {

            longPressed = true;


            cell.classList.remove(
              "planned"
            );


            cell.classList.add(
              "completed"
            );


            studyData[key] =
              "completed";


            saveStudyData();

            updateCounts();


            if (
              navigator.vibrate
            ) {

              navigator.vibrate(
                35
              );
            }

          }, 550);
      }


      function cancelPress() {

        if (pressTimer) {

          clearTimeout(
            pressTimer
          );

          pressTimer = null;
        }
      }


      /* 手機 */

      cell.addEventListener(
        "touchstart",
        startPress,
        {
          passive: true
        }
      );


      cell.addEventListener(
        "touchend",
        cancelPress
      );


      cell.addEventListener(
        "touchmove",
        cancelPress
      );


      cell.addEventListener(
        "touchcancel",
        cancelPress
      );


      /* 電腦 */

      cell.addEventListener(
        "mousedown",
        startPress
      );


      cell.addEventListener(
        "mouseup",
        cancelPress
      );


      cell.addEventListener(
        "mouseleave",
        cancelPress
      );


      /* ==============================
         普通點擊
      ============================== */

      cell.addEventListener(
        "click",
        function () {

          if (longPressed) {

            longPressed = false;

            return;
          }


          /* 空白 → 淺色 */

          if (
            !cell.classList.contains(
              "planned"
            )
            &&
            !cell.classList.contains(
              "completed"
            )
          ) {

            cell.classList.add(
              "planned"
            );


            studyData[key] =
              "planned";
          }


          /* 淺色 → 空白 */

          else if (
            cell.classList.contains(
              "planned"
            )
          ) {

            cell.classList.remove(
              "planned"
            );


            delete studyData[key];
          }


          /* 深色 → 空白 */

          else if (
            cell.classList.contains(
              "completed"
            )
          ) {

            cell.classList.remove(
              "completed"
            );


            delete studyData[key];
          }


          saveStudyData();

          updateCounts();
        }
      );


      row.appendChild(
        cell
      );
    });


    /* 完成堂數 */

    const countCell =
      document.createElement("td");


    countCell.className =
      "count-cell";


    countCell.dataset.subject =
      subject;


    row.appendChild(
      countCell
    );


    tableBody.appendChild(
      row
    );
  }
);


/* ==================================================
   儲存上方
================================================== */

function saveStudyData() {

  localStorage.setItem(
    "studyPlanData",

    JSON.stringify(
      studyData
    )
  );
}


/* ==================================================
   更新堂數
================================================== */

function updateCounts() {

  subjects.forEach(
    subject => {

      let count = 0;


      dates.forEach(
        date => {

          const key =
            `${subject}_${getDateKey(date)}`;


          if (
            studyData[key]
            ===
            "completed"
          ) {

            count++;
          }
        }
      );


      const countCell =
        document.querySelector(
          `.count-cell[data-subject="${subject}"]`
        );


      countCell.innerHTML = `

        <span class="count-number">
          ${count}
        </span>

        <span class="count-text">
          堂
        </span>

      `;
    }
  );
}


updateCounts();


/* ==================================================
   下方 3D 紀錄卡
================================================== */

const carousel =
  document.getElementById(
    "recordsCarousel"
  );


const defaultDate =
  getDateKey(startDate);


/* ==================================================
   建立 8 張卡
================================================== */

subjects.forEach(
  (subject, index) => {

    const card =
      document.createElement(
        "article"
      );


    card.className =
      "record-card";


    card.dataset.index =
      index;


    card.innerHTML = `

      <div class="record-subject">
        ${subject}
      </div>


      <input
        type="date"
        class="record-date"
        min="${getDateKey(startDate)}"
        max="${getDateKey(endDate)}"
        value="${defaultDate}"
      >


      <textarea
        class="record-input"
        placeholder="輸入學習內容..."
        inputmode="text"
      ></textarea>


      <div class="history-list"></div>

    `;


    carousel.appendChild(
      card
    );


    const dateInput =
      card.querySelector(
        ".record-date"
      );


    const textArea =
      card.querySelector(
        ".record-input"
      );


    const historyList =
      card.querySelector(
        ".history-list"
      );


    /* =========================================
       目前日期的 key
    ========================================= */

    function getRecordKey() {

      return (
        `${subject}_${dateInput.value}`
      );
    }


    /* =========================================
       日期切換時

       如果該日期已經有內容，
       放回輸入框讓你直接修改。
    ========================================= */

    function loadCurrentDate() {

      const key =
        getRecordKey();


      textArea.value =
        recordData[key] || "";
    }


    /* =========================================
       儲存
    ========================================= */

    function saveRecord() {

      const key =
        getRecordKey();


      const text =
        textArea.value.trim();


      if (text === "") {

        /*
          空白不建立新紀錄。
          如果以前有紀錄，
          也不在 blur 時直接刪除，
          避免誤刪。
        */

        return;
      }


      recordData[key] =
        text;


      localStorage.setItem(
        "studyRecordData",

        JSON.stringify(
          recordData
        )
      );


      renderHistory();
    }


    /* =========================================
       畫出該科所有紀錄
    ========================================= */

    function renderHistory() {

      historyList.innerHTML = "";


      const subjectPrefix =
        `${subject}_`;


      const records =
        Object.entries(
          recordData
        )

        /*
          只取目前這科
        */

        .filter(
          ([key, value]) => {

            return (
              key.startsWith(
                subjectPrefix
              )
              &&
              value.trim() !== ""
            );
          }
        )

        /*
          轉成日期＋內容
        */

        .map(
          ([key, value]) => {

            const date =
              key.substring(
                subjectPrefix.length
              );


            return {
              date,
              text: value
            };
          }
        )

        /*
          最新日期排最前面
        */

        .sort(
          (a, b) => {

            return (
              b.date.localeCompare(
                a.date
              )
            );
          }
        );


      /* 沒紀錄 */

      if (
        records.length === 0
      ) {

        const empty =
          document.createElement(
            "div"
          );


        empty.className =
          "history-empty";


        empty.textContent =
          "尚無紀錄";


        historyList.appendChild(
          empty
        );


        return;
      }


      /* 建立紀錄 */

      records.forEach(
        record => {

          const item =
            document.createElement(
              "div"
            );


          item.className =
            "history-item";


          const date =
            document.createElement(
              "div"
            );


          date.className =
            "history-date";


          date.textContent =
            formatDisplayDate(
              record.date
            );


          const text =
            document.createElement(
              "div"
            );


          text.className =
            "history-text";


          text.textContent =
            record.text;


          item.appendChild(
            date
          );


          item.appendChild(
            text
          );


          historyList.appendChild(
            item
          );
        }
      );
    }


    /* 日期改變 */

    dateInput.addEventListener(
      "change",
      function () {

        loadCurrentDate();
      }
    );


    /*
      手機鍵盤按「完成」
      textarea 通常會失焦，
      此時儲存。
    */

    textArea.addEventListener(
      "blur",
      function () {

        saveRecord();
      }
    );


    /*
      打字時也同步儲存，
      避免 App / 瀏覽器突然被關掉。
    */

    let typingTimer;


    textArea.addEventListener(
      "input",
      function () {

        clearTimeout(
          typingTimer
        );


        typingTimer =
          setTimeout(() => {

            saveRecord();

          }, 500);
      }
    );


    loadCurrentDate();

    renderHistory();
  }
);


/* ==================================================
   3D 卡片位置
================================================== */

function updateCardPositions() {

  const cards =
    Array.from(
      document.querySelectorAll(
        ".record-card"
      )
    );


  const carouselRect =
    carousel.getBoundingClientRect();


  const center =
    carouselRect.left
    +
    carouselRect.width / 2;


  let activeIndex = 0;

  let closestDistance =
    Infinity;


  /* 找最靠近畫面中央的卡 */

  cards.forEach(
    (card, index) => {

      const rect =
        card.getBoundingClientRect();


      const cardCenter =
        rect.left
        +
        rect.width / 2;


      const distance =
        Math.abs(
          cardCenter - center
        );


      if (
        distance
        <
        closestDistance
      ) {

        closestDistance =
          distance;

        activeIndex =
          index;
      }
    }
  );


  /* 套用前後關係 */

  cards.forEach(
    (card, index) => {

      card.classList.remove(
        "active",
        "before",
        "after"
      );


      if (
        index === activeIndex
      ) {

        card.classList.add(
          "active"
        );
      }

      else if (
        index < activeIndex
      ) {

        card.classList.add(
          "before"
        );
      }

      else {

        card.classList.add(
          "after"
        );
      }
    }
  );
}


/* ==================================================
   滑動時即時更新 3D 效果
================================================== */

carousel.addEventListener(
  "scroll",
  function () {

    requestAnimationFrame(
      updateCardPositions
    );
  }
);


/* ==================================================
   第一次載入
================================================== */

updateCardPositions();