import 'tippy.js/themes/light.css';
import 'tippy.js/themes/translucent.css';
import 'tippy.js/dist/svg-arrow.css';

import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';
import rrulePlugin from '@fullcalendar/rrule';
import timeGridPlugin from '@fullcalendar/timegrid';
import tippy from 'tippy.js';

import type { Event } from './types';

window.Webflow ||= [];
window.Webflow.push(() => {
  const calendarElement = document.querySelector<HTMLDivElement>('[data-element="calendar"]');
  if (!calendarElement) return;

  const events = getEvents();
  console.log({ events });

  const calendar = new Calendar(calendarElement, {
    plugins: [dayGridPlugin, listPlugin, rrulePlugin],
    initialView: 'dayGridMonth',
    //initialView: 'listWeek',
    //multiMonthMaxColumns: 1,
    fixedWeekCount: false,
    showNonCurrentDates: false,
    slotMinTime: '08:00:00',
    height: 'auto',
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'dayGridMonth,listMonth',
    },

    buttonText: {
      month: 'Mois',
      list: 'Liste',
    },

    events,

    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      meridiem: false,
    },

    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      meridiem: false,
    },

    windowResize: function () {
      if (window.innerWidth > 1000) {
        calendar.changeView('dayGridMonth');
      } else if (window.innerWidth < 1000) {
        calendar.changeView('listMonth');
      }
    },

    /*events: [
      {
        title: 'TEST #2 my recurring event',
        backgroundColor: 'lime',
        rrule: {
          freq: 'weekly',
          interval: 1,
          byweekday: ['mo', 'fr'],
          dtstart: '2023-04-11T10:30:00',
          until: '2024-06-01',
        },
        duration: '01:00',
        exdate: ['2023-04-28T10:30:00', '2023-05-26T10:30:00'],
      },
    ],*/

    /*eventTimeFormat: {
      // like '14:30:00'
      hour: 'numeric',
      meridiem: 'short',
    },*/

    eventMouseEnter(data) {
      const lieu = data.event.extendedProps.localisation;
      const h = data.event.extendedProps.horaire;
      tippy(data.el, {
        //content: lieu + ' indisponible // ' + h,
        content:
          '<div style="padding:15px;"><p style="color:black; font-family:Red Hat Display, sans-serif; font-size:1.25rem; line-height:125%; margin:5px 0px;">' +
          lieu +
          ' indisponible </p><img style="margin-right:5px; width:14px;"src = "https://uploads-ssl.webflow.com/63e60ae0d172c02222cc9e79/641e2de18be4f26e9913a9e2_clock%201.svg" > </img>' +
          h +
          '</div></div>',
        placement: 'bottom',
        allowHTML: true,
        arrow: true,
        theme: 'light',
      });
    },
  });

  calendar.render();
});

const getEvents = (): Event[] => {
  const scripts = document.querySelectorAll<HTMLScriptElement>('[data-element="event-data"]');

  const events = [...scripts].map((script) => {
    const event: Event = JSON.parse(script.textContent!);
    //add background to event
    event.display = 'list-item';
    event.title = event.extendedProps.localisation + ' indisponible';
    event.url = '';

    //apostrophe display
    event.title = event.title.replace(/&#39;/g, "'");

    // get all the collection dates in date format
    const startDate = new Date(event.startday);
    const endDate = new Date(event.endday);

    //START DATE
    //day
    const startDay = startDate.getDate();
    let startDayOk;
    if (startDay < 10) {
      startDayOk = ('0' + startDay).slice(-2);
    } else {
      startDayOk = startDay;
    }

    // month
    const startMonth = startDate.getMonth() + 1;
    let startMonthOk;

    if (startMonth < 10) {
      startMonthOk = ('0' + startMonth).slice(-2);
    } else {
      startMonthOk = startMonth;
    }
    //year
    const startYear = startDate.getFullYear();

    //assign to dtstart
    event.rrule.dtstart = startYear + '-' + startMonthOk + '-' + startDayOk + 'T' + event.startTime;

    // END DATE
    //day
    const endDay = endDate.getDate();
    let endDayOk;
    if (endDay < 10) {
      endDayOk = ('0' + endDay).slice(-2);
    } else {
      endDayOk = endDay;
    }

    // month
    const endMonth = endDate.getMonth() + 1;
    let endMonthOk;
    if (endMonth < 10) {
      endMonthOk = ('0' + endMonth).slice(-2);
    } else {
      endMonthOk = endMonth;
    }
    //year
    const endYear = endDate.getFullYear();

    //assign to until
    event.rrule.until = endYear + '-' + endMonthOk + '-' + endDayOk;

    //WEEKDAYS
    const weekDays = event.getbyweekday;
    const weekDaysArray = weekDays.split(',');

    if (weekDaysArray.length > 0) {
      for (let i = 0; i < weekDaysArray.length; i++) {
        event.rrule.byweekday = weekDaysArray;
      }
    }

    // FREQUENCY
    if (event.rrule.freq === '') {
      event.rrule.freq = 'daily';
    }

    // INTERVAL
    if (event.rrule.interval === null) {
      event.rrule.interval = 1;
    }

    //EXCEPTION DATES
    const exDateArray = event.getexdate;
    const noEmpty = Array.from(exDateArray.filter((e) => e));

    if (noEmpty.length > 0) {
      for (let i = 0; i < noEmpty.length; i++) {
        const exDate = new Date(noEmpty[i]);

        //day
        const exDay = exDate.getDate();
        let exDayOk;
        if (exDay < 10) {
          exDayOk = ('0' + exDay).slice(-2);
        } else {
          exDayOk = exDay;
        }

        // month
        const exMonth = exDate.getMonth() + 1;
        let exMonthOk;
        if (exMonth < 10) {
          exMonthOk = ('0' + exMonth).slice(-2);
        } else {
          exMonthOk = exMonth;
        }

        //year
        const exYear = exDate.getFullYear();

        const fullExDate = exYear + '-' + exMonthOk + '-' + exDayOk + 'T' + event.startTime;

        //assign to ex date
        event.exdate.push(fullExDate);
      }
    } else {
      //delete event.exdate;
    }

    //BACKGROUND COLOR :
    if (event.extendedProps.localisation === 'Théâtre') {
      event.backgroundColor = '#c33149';
    } else if (event.extendedProps.localisation === 'Foyer') {
      event.backgroundColor = '#0A0A0A';
    } else if (event.extendedProps.localisation === 'Studio') {
      event.backgroundColor = '#8f8f8f';
    }

    return event;
  });

  return events;
};
