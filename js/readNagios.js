const CALENDAR_BASE = 'http://www.google.com/calendar/feeds/';
const CALENDAR_JSON = '/public/full?alt=json-in-script&orderby=starttime&singleevents=true&sortorder=ascending&futureevents=true&callback=?';

const DEV_CALENDAR = 'agent.ru_h5u4e6ia2r1b9bvmhah7ca6nog%40group.calendar.google.com';
const SIGNIFICANT_CALENDAR = 'agent.ru_rfced10de8cbh9juug1vvjpjss@group.calendar.google.com';

function updateNagios() {
    $.getJSON('/vshell/index.php?type=services&mode=json', function(data) {
        $.each(data, function () {
            service = this["service_description"];
            state = this["current_state"];
            $("#service" + service).removeClass("statusOK statusCRITICAL statusERROR statusWARNING");
            $("#service" + service).addClass("status" + state);
            $("#lastUpdated").html('Last Updated at ' + new Date().toLocaleTimeString());
        })
    });
}

function updateGoogleCalendar() {
    $('#calendar table').empty();

    var out = '';

    $
        .getJSON(CALENDAR_BASE + DEV_CALENDAR + CALENDAR_JSON + '&max-results=10', function (data) {
        $.each(data["feed"]["entry"], function(value, data) {
            if (data["title"]["$t"] == "Daily standup") {
                return;
            }
            var calDate = new Date(data["gd$when"][0]["startTime"]);
            if (isNaN(calDate.valueOf())) {
                calDate = Date.parseExact(data["gd$when"][0]["startTime"], "yyyy-MM-dd");
            }
            dateString = calDate.getDate() + "/" + (calDate.getMonth() + 1);
            event = data["title"]["$t"].replace(/([^,]+),?.*/, '$1');
            $('#calendar table')
                .append("<tr><td class='date'>" + dateString + "</td><td class='event'>" + event + "</td></tr>\n");
        })
    })

    var weekday = new Array(7);
    weekday[0] = "Воскресенье";
    weekday[1] = "Понедельник";
    weekday[2] = "Вторник";
    weekday[3] = "Среда";
    weekday[4] = "Четверг";
    weekday[5] = "Пятница";
    weekday[6] = "Суббота";

    $('#calendarDate').empty();
    today = new Date();
    $('#calendarDate').append(weekday[today.getDay()] + " " + today.getDate() + "/" + (today.getMonth() + 1));
}

function updateSignificantEvent() {
    $('#comingup').empty();

    var out = '';

    $
        .getJSON('http://www.google.com/calendar/feeds/' + SIGNIFICANT_CALENDAR + CALENDAR_JSON + '&max-results=1', function (data) {
        entry = data["feed"]["entry"][0];
        var calDate = new Date(entry["gd$when"][0]["startTime"]);
        if (isNaN(calDate.valueOf())) {
            calDate = Date.parseExact(entry["gd$when"][0]["startTime"], "yyyy-MM-dd");
        }
        calDate.setHours(0);
        calDate.setMinutes(0);
        calDate.setSeconds(0);
        todayDate = new Date();
        days = Math.floor((calDate.valueOf() - todayDate.valueOf()) / 1000 / 3600 / 24);
        if (days < 1) {
            remaining = "сегодня";
        }
        else if (days == 1) {
            remaining = "завтра";
        }
        else {
            remaining = "через " + days + " дней";
        }
        outString = entry["title"]["$t"].replace(/(SIGNIFICANT: )([^-]+ - )(.+)/, "$3");
        $('#comingup').append("<b>" + outString + "</b> " + remaining + "\n");
    })
}

function updateTwitter() {
    jQuery(function($) {
        $(".tweet").tweet({
            query: "@agentru_tweets",
            avatar_size: 32,
            count: 10,
            template: "{avatar} {text}   ",
            loading_text: "loading tweets..."
        });
    });
    jQuery(function($) {
        $(".cicsstatus").tweet({
            query: "#agentru",
            avatar_size: 32,
            count: 10,
            template: "{avatar} {text}   ",
            loading_text: "loading tweets..."
        });
    });
}

function updateGraphs() {
    $.getJSON('/vshell/index.php?type=services&mode=json', function(data) {
        var state = [];
        state["CRITICAL"] = 0;
        state["WARNING"] = 0;
        state["OK"] = 0;
        state["UNKNOWN"] = 0;
        var largestState = 0;

        $.each(data, function () {
            state[this["current_state"]]++;
            if (state[this["current_state"]] > largestState) {
                largestState = state[this["current_state"]];
            }
        });

        // find out the height of our containers so we don't break the view
        chartDivHeight = $('#chartA').height();
        chartHeader = $('.columnHeader').height();
        chartTitle = $('.columnTitle').height();
        maxColumnHeight = chartDivHeight - (chartHeader + chartTitle);

        scaleFactor = maxColumnHeight / largestState;
        $('#column_1').height(Math.floor(scaleFactor * state["OK"]));
        $('#columnContainer_1 .header_A').html(state["OK"]);
        $('#column_2').height(Math.floor(scaleFactor * state["WARNING"]));
        $('#columnContainer_2 .header_A').html(state["WARNING"]);
        $('#column_3').height(Math.floor(scaleFactor * state["CRITICAL"]));
        $('#columnContainer_3 .header_A').html(state["CRITICAL"]);
        $('#column_4').height(Math.floor(scaleFactor * state["UNKNOWN"]));
        $('#columnContainer_4 .header_A').html(state["UNKNOWN"]);
    });
}


$(document).ready(function () {
    $.getJSON('/teamcity/httpAuth/app/rest/builds/name:Dev?callback=?', function(data) {
        alert(data)
    }, "text")
    //  updateNagios();
//  setInterval( updateNagios, 5*1000 );
    updateGoogleCalendar();
    setInterval(updateGoogleCalendar, 900 * 1000);
    updateSignificantEvent();
    setInterval(updateSignificantEvent, 900 * 1000);
    updateTwitter();
    setInterval(updateTwitter, 300 * 1000);
//  updateGraphs();
//  setInterval( updateGraphs, 5*1000 );
})

