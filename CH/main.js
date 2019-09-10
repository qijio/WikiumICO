"use strict";
$(function () {
    fillHead();
    setTimeout(setTimer, 100);
    setInterval(setTimer, 1000);

    drawChartLine1();
    drawChartLine2();
    drawChartPie();

    changeBgColor();
    $(document).scroll(changeBgColor);
    $('#navbarToggler').on('show.bs.collapse', setBgColor)
                       .on('hidden.bs.collapse', changeBgColor);

    $(document).on('click', '[data-toggle="lightbox"]', function (event) {
        event.preventDefault();
        $(this).ekkoLightbox();
    }).on('click', '[data-toggle="clearCalc"]', function (event) {
        event.preventDefault();
        clearCalc();
    });

    if (matchMedia) {
        const mq = window.matchMedia('(min-width: 575px)');
        mq.addListener(widthChange);
        widthChange(mq);
    }
    redrawGradientsOnResize();
    setResizeHandler(redrawGradientsOnResize, 250);

    particlesJS.load('head', '../particlesjs-config.min.json');

    $('#copy-smart-address').on('click', function () {
        selectText('smart-address');
        document.execCommand('Copy');
        $('#copy-smart-address').attr('title', 'Copied!').tooltip('show');
    });

    $('#eth-input').on('change paste keyup', function () {
        calculate($('#eth-input'), $('#usd-input'), $('#token-input'));
    });
    $('#usd-input').on('change paste keyup', function () {
        calculate($('#eth-input'), $('#usd-input'), $('#token-input'));
    });
    $('#token-input').on('change paste keyup', function () {
        calculate($('#eth-input'), $('#usd-input'), $('#token-input'));
    });

    $('#eth-input-modal').on('change paste keyup', function () {
        calculate($('#eth-input-modal'), $('#usd-input-modal'), $('#token-input-modal'));
    });
    $('#usd-input-modal').on('change paste keyup', function () {
        calculate($('#eth-input-modal'), $('#usd-input-modal'), $('#token-input-modal'));
    });
    $('#token-input-modal').on('change paste keyup', function () {
        calculate($('#eth-input-modal'), $('#usd-input-modal'), $('#token-input-modal'));
    });

    $('a[href*="#"]')// Select all links with hashes
    .not('[href="#"]')// Remove links that don't actually link to anything
    .not('[href="#0"]')
    .click(smoothScroll);
    
    AOS.init({
        once: true,
        anchor: "top-bottom",
        offset: -5,
        delay: 0,
    });
    
    let height = $(window).outerHeight();
    $(window).resize(function() {
        if ($(window).outerHeight() == height) return;
        height = $(window).outerHeight();
        AOS.refresh();
    });
});

function fillHead() {
    $.getJSON('../data.json', function (local) {
        let now = new Date();
        let startDate = toDate(local.startDate);
        let preIcoDate = toDate(local.preIcoDate);
        let icoDate = toDate(local.icoDate);
        let endDate = toDate(local.endDate);

        let timeProgressStart = 0;
        let previousDate = startDate;

        if (now < preIcoDate) {
            window.timerDate = preIcoDate;
            window.currentPrice = local.ebPrice;
        }
        else if (now < icoDate) {
            timeProgressStart = 33.3;
            previousDate = preIcoDate;
            window.timerDate = icoDate;
            window.currentPrice = local.preIcoPrice;
        }
        else if (now < endDate){
            timeProgressStart = 66.6;
            previousDate = icoDate;
            window.timerDate = endDate;
            window.currentPrice = local.icoPrice;
            $('#timerHeader').text('Until the end of the company:');
        }
        else {
            //вероятно по завершению нужно сделать что-то другое)
            timeProgressStart = 66.6;
            previousDate = endDate;
            window.timerDate = new Date(now.getFullYear() + 1, 0, 0);
            $('#timerHeader').text('Until the new Year:'); 
        }
        
        let distNowTo = window.timerDate - now;
        let distFromTo = window.timerDate - previousDate;
        let percent = timeProgressStart +
            (100 - ((distNowTo / distFromTo) * 100)) / 3;
        $("#timeProgress").width(percent.toFixed(2)+'%');
        
        $('#ebPrice').text(local.ebPrice);
        $('#preIcoPrice').text(local.preIcoPrice);
        $('#icoPrice').text(local.icoPrice);
        
        $('#startDate').prop('title', local.startDate).tooltip();
        $('#preIcoDate').prop('title', local.preIcoDate).tooltip();
        $('#icoDate').prop('title', local.icoDate).tooltip();
        $('#endDate').prop('title', local.endDate).tooltip();

        $('#currentPrice').text(window.currentPrice.toFixed(2));
        $('#discount10').text((window.currentPrice * 0.9).toFixed(2));
        $('#discount20').text((window.currentPrice * 0.8).toFixed(2));
        $('#discount30').text((window.currentPrice * 0.7).toFixed(2));

        $.getJSON('http://ico.hashpower.ru/json', function (remote) {
            window.usdEthCourse = remote.Course / 100
            let usdCollected = remote.CollectEth * window.usdEthCourse;
            $("#usdCollected").text(addSpaces(Math.round(usdCollected)));

            let step = 0;
            let pgSteps = [0, 22.5, 48.5, 74.5, 100]; //фикс отступов
            let priceSteps = [
                0,
                7 * 1000000,
                12 * 1000000,
                20 * 1000000,
                30 * 1000000
            ];

            if (usdCollected < priceSteps[1]) {}
            else if (usdCollected < priceSteps[2]) step = 1;            
            else if (usdCollected < priceSteps[3]) step = 2;
            else step = 3;

            let distNowTo = priceSteps[step + 1] - usdCollected;
            let distFromTo = priceSteps[step + 1] - priceSteps[step];
            let percent = pgSteps[step]
                + ((pgSteps[step + 1] - pgSteps[step])
                    * (1 - (distNowTo / distFromTo)));

            $("#usdProgress").width(percent.toFixed(2)+'%');
            clearCalc();
        });
    });
}

function setTimer() {
    // Find the distance between now an the count down date
    let distance = window.timerDate - $.now();            
    // Time calculations for days, hours, minutes and seconds
    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    $('#days').text(days);
    $('#hours').text(hours);
    $('#minutes').text(minutes);
    $('#seconds').text(seconds);

    if (distance < 0) fillHead();
}

function smoothScroll(event) {
    // On-page links
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '')
        && location.hostname == this.hostname) {
        // Figure out element to scroll to
        let target = $(this.hash);
        target = target.length
            ? target
            : $('[name=' + this.hash.slice(1) + ']');
            // Does a scroll target exist?
            if (target.length) {
            // Only prevent default if animation is actually gonna happen
            event.preventDefault();
            $('html, body').animate({
                scrollTop: target.offset().top,
            }, 1000, function() {
                // Callback after animation
                // Must change focus!
                let $target = $(target);
                $target.focus();
                // Checking if the target was focused
                if ($target.is(':focus')) {
                    return false;
                } else {
                    // Adding tabindex for elements not focusable
                    $target.attr('tabindex', '-1');
                    $target.focus(); // Set focus again
                };
            });
        }
    }
}

function selectText(containerId) {
    if (document.selection) {
        let range = document.body.createTextRange();
        range.moveToElementText(document.getElementById(containerId));
        range.select();
    } else if (window.getSelection) {
        let range = document.createRange();
        range.selectNode(document.getElementById(containerId));
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    }
}

function calculate(ethIn, usdIn, tokenIn) {
    let eth = ethIn.val();
    let usd = usdIn.val();
    let token = tokenIn.val();
    
    if (ethIn.is(':focus')) {
        if (eth == "") {
            clearCalc();
            return;
        }

        let newUsd = (eth * window.usdEthCourse).toFixed(2);
        let d = getDiscount(newUsd);
        usdIn.val(newUsd);
        tokenIn.val((newUsd / d.price).toFixed(2));
    } else if (usdIn.is(':focus')) {
        if (usd == "") {
            clearCalc();
            return;
        }

        let d = getDiscount(usd);
        ethIn.val((usd / window.usdEthCourse).toFixed(2));
        tokenIn.val((usd / d.price).toFixed(2));
    } else if (tokenIn.is(':focus')) {
        if (token == "") {
            clearCalc();
            return;
        }

        let newUsd = token * $('#discount30').text();
        if (newUsd < 100000)
            newUsd = token * $('#discount20').text();
        if (newUsd < 10000)
            newUsd = token * $('#discount10').text();
        if (newUsd < 1000)
            newUsd = token * window.currentPrice;        
        newUsd = newUsd.toFixed(2);

        let d = getDiscount(newUsd);
        let discountedToken = (newUsd / d.price).toFixed(2)
        if (Math.ceil(token) < new Number(discountedToken))
            $('[id^="currentDiscount"] > strong')
                .append(" (you&nbsp;get:&nbsp;" + discountedToken + "WTK)");

        usdIn.val(newUsd);
        ethIn.val((newUsd / window.usdEthCourse).toFixed(2));
    }

    $('[id^="eth-input"]').val(ethIn.val());
    $('[id^="usd-input"]').val(usdIn.val());;
    $('[id^="token-input"]').val(tokenIn.val());;
}

function getDiscount(usd) {
    let result = '';
    if (usd >= 100000)
        result = new Discount('30%', $('#discount30').text());
    else if (usd >= 10000)
        result = new Discount('20%', $('#discount20').text());
    else if (usd >= 1000)
        result = new Discount('10%', $('#discount10').text());
    else result = new Discount('0%', window.currentPrice);
    
    if (result.price == window.currentPrice)
        $('[id^="currentDiscount"]').removeClass('show');
    else
        $('[id^="currentDiscount"]').addClass('show')
            .children('strong').text(result.percent);
    
    return result;
}

function Discount(percent, price){
    this.percent = percent;
    this.price = price;
}

function clearCalc() {
    let eth = 1;
    let usd = new Number((eth * window.usdEthCourse).toFixed(2));
    let d = getDiscount(usd);
    let token = new Number((usd / d.price).toFixed(2));
    $('[id^="eth-input"]').attr("placeholder", eth.toLocaleString()).val('');
    $('[id^="usd-input"]').attr("placeholder", usd.toLocaleString()).val('');
    $('[id^="token-input"]').attr("placeholder", token.toLocaleString()).val('');
}

function changeBgColor() {
    let $nav = $('#nav');
    let $targetHeight = $nav.height();

    let $bs = document.body.scrollTop;
    let $des = document.documentElement.scrollTop;
    let $scrollBool = $bs > $targetHeight || $des > $targetHeight;
    let $showBool = $('#navbarToggler').hasClass('show');

    $nav.toggleClass('bg-dark', $scrollBool || $showBool);
};

function setBgColor() {
    let $nav = $('#nav');
    if ($nav.hasClass('bg-dark') == false) {
        $nav.addClass('bg-dark');
    }
};

function drawChartLine1() {
    // LINE1 incomeChart colors
    let gr = getIncomeGradients();
    // LINE1 incomeChart colors

    // LINE1 incomeChart draw&data
    window.incomeChart = new Chart(gr.ctx, {
        type: 'line',
        data: {
            labels: [
                '2018 Q1', 'Q2', 'Q3', 'Q4',
                '2019 Q1', 'Q2', 'Q3', 'Q4',
                '2020 Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                label: 'Revenues',
                borderColor: gr.stroke,
                pointBorderColor: gr.stroke,
                pointBackgroundColor: gr.stroke,
                pointHoverBackgroundColor: gr.stroke,
                pointHoverBorderColor: gr.stroke,
                pointBorderWidth: 0,
                pointHoverRadius: 8,
                pointHoverBorderWidth: 0,
                pointRadius: 5,
                fill: true,
                backgroundColor: gr.fill,
                borderWidth: 4,
                data: [
                    822154, 671225, 699912, 1217291,
                    1632950, 1429027, 1516020, 2567321,
                    2688179, 2428070, 2698413, 3916012],
            }],
        },
        options: {
            responsive: true,
            legend: {
                display: false,
            },
            tooltips: {
                backgroundColor: 'rgba(42, 36, 76, 0.8)',
                displayColors: false,
                callbacks: {
                    label: function (tooltipItems, data) {
                        return '$' + addSpaces(data.datasets[0].data[tooltipItems.index]);
                    },
                },
            },
            scales: {
                yAxes: [{
                    ticks: {
                        fontColor: 'rgba(0,0,0,0.5)',
                        fontStyle: 'bold',
                        beginAtZero: false,
                        maxTicksLimit: 5,
                        padding: 5,
                        callback: function (value, index, values) {
                            return '$' + value
                                .toString()
                                .replace(new RegExp('000000' + '$'), ' m');
                        },
                    },
                    gridLines: {
                        drawTicks: false,
                        display: false,
                    },

                }],
                xAxes: [{
                    gridLines: {
                        zeroLineColor: 'transparent',
                    },
                    ticks: {
                        padding: 10,
                        fontColor: 'rgba(0,0,0,0.5)',
                        fontStyle: 'bold',
                    },
                }],
            },
            plugins: {
                datalabels: {
                    display: false,
                },
            },
        },
    });
    // LINE1 incomeChart draw&data
};

function drawChartLine2() {
    // LINE2 usersChart colors
    let gr = getUsersGradients();
    // LINE2 usersChart colors

    // LINE2 usersChart draw&data
    window.usersChart = new Chart(gr.ctx, {
        type: 'line',
        data: {
            labels: [
                '2018 Q1', 'Q2', 'Q3', 'Q4',
                '2019 Q1', 'Q2', 'Q3', 'Q4',
                '2020 Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                label: 'Clients',
                borderColor: gr.stroke,
                pointBorderColor: gr.stroke,
                pointBackgroundColor: gr.stroke,
                pointHoverBackgroundColor: gr.stroke,
                pointHoverBorderColor: gr.stroke,
                pointBorderWidth: 0,
                pointHoverRadius: 8,
                pointHoverBorderWidth: 0,
                pointRadius: 5,
                fill: true,
                backgroundColor: gr.fill,
                borderWidth: 4,
                data: [
                    1967845, 2320226, 2671004, 3294182,
                    4092418, 4817161, 5546652, 6828962,
                    8134502, 9288355, 10563068, 12428764],
                }],
        },
        options: {
            responsive: true,
            legend: {
                display: false,
            },
            tooltips: {
                backgroundColor: 'rgba(20, 90, 50, 0.8)',
                displayColors: false,
                callbacks: {
                    label: function (tooltipItems, data) {
                        return addSpaces(data.datasets[0].data[tooltipItems.index]);
                    },
                },
            },
            scales: {
                yAxes: [{
                    ticks: {
                        fontColor: 'rgba(0,0,0,0.5)',
                        fontStyle: 'bold',
                        beginAtZero: true,
                        maxTicksLimit: 5,
                        padding: 5,
                        callback: function (value, index, values) {
                            return '$' + value
                                .toString()
                                .replace(new RegExp('000000' + '$'), ' m');
                        },
                    },
                    gridLines: {
                        drawTicks: false,
                        display: false,
                    },
                }],
                xAxes: [{
                    gridLines: {
                        zeroLineColor: 'transparent',
                    },
                    ticks: {
                        padding: 10,
                        fontColor: 'rgba(0,0,0,0.5)',
                        fontStyle: 'bold',
                    },
                }],
            },
            plugins: {
                datalabels: {
                    display: false,
                },
            },
        },
    });
    // LINE2 usersChart draw&data
}

function drawChartPie() {
    // PIE tokenChart data
    let parts = [10, 5, 10, 10, 12, 8, 15, 5, 10, 15];
    let names = [
        'Wage fund',
        'Antifrod',
        'Marketing of existing products',
        'Bounty',
        'Operating expenses',
        'Advisors, escrow, IR',
        'Marketing of new products',
        'Equipment',
        'Research and patents',
        'The founders of the project'];

    for (let i = 0; i < parts.length; i++) {
        names[i] = parts[i] + '%' + ' — ' + names[i];
    };
    // PIE tokenChart data

    // PIE tokenChart draw
    window.tokenChart = new Chart('tokenChart', {
        type: 'pie',
        data: {
            labels: names,
            datasets: [{
                label: 'Distribution of tokens',
                backgroundColor: [
                    '#4472C4',
                    '#5B9BD5',
                    '#ED7D31',
                    '#FFC000',
                    '#2ECC71',
                    '#70AD47',
                    '#16A085',
                    '#A5A5A5',
                    '#9B59B6',
                    '#E74C3C',
                ],
                data: parts,
            }],
        },
        options: {
            responsive: true,
            plugins: {
                datalabels: {
                    backgroundColor: function (context) {
                        return context.dataset.backgroundColor;
                    },
                    anchor: 'end',
                    borderColor: 'white',
                    borderRadius: 25,
                    borderWidth: 2,
                    color: 'white',
                    display: function (context) {
                        let dataset = context.dataset;
                        let value = dataset.data[context.dataIndex];
                        return value + '%';
                    },
                    font: {
                        weight: 'bold',
                    },
                    formatter: function (value, context) {
                        return Math.round(value) + '%';
                    },
                },
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItems, data) {
                        return data.labels[tooltipItems.index];
                    },
                },
            },
            legend: {
                position: 'right',
            },
            layout: {
                padding: 10,
            },
        },
    });
    // PIE tokenChart draw
}

function redrawGradientsOnResize() {
    let iGr = getIncomeGradients();
    window.incomeChart.data.datasets[0].borderColor = iGr.stroke;
    window.incomeChart.data.datasets[0].pointBorderColor = iGr.stroke;
    window.incomeChart.data.datasets[0].pointBackgroundColor = iGr.stroke;
    window.incomeChart.data.datasets[0].pointHoverBackgroundColor = iGr.stroke;
    window.incomeChart.data.datasets[0].pointHoverBorderColor = iGr.stroke;
    window.incomeChart.data.datasets[0].backgroundColor = iGr.fill;
    window.incomeChart.update();
    let uGr = getUsersGradients();
    window.usersChart.data.datasets[0].borderColor = uGr.stroke;
    window.usersChart.data.datasets[0].pointBorderColor = uGr.stroke;
    window.usersChart.data.datasets[0].pointBackgroundColor = uGr.stroke;
    window.usersChart.data.datasets[0].pointHoverBackgroundColor = uGr.stroke;
    window.usersChart.data.datasets[0].pointHoverBorderColor = uGr.stroke;
    window.usersChart.data.datasets[0].backgroundColor = uGr.fill;
    window.usersChart.update();
}

function getIncomeGradients() {
    let canvas = document.getElementById('incomeChart');
    let ctx = canvas.getContext('2d');
    let gradientStroke =
        ctx.createLinearGradient(0, 0, canvas.clientWidth, 0);
    gradientStroke.addColorStop(0, '#80b6f4');
    gradientStroke.addColorStop(1, '#8b50ca');
    let gradientFill =
        ctx.createLinearGradient(0, 0, 0, canvas.clientHeight);
    gradientFill.addColorStop(0, 'rgba(132, 146, 229, 0.8)');
    gradientFill.addColorStop(0.75, 'rgba(132, 146, 229, 0.0)');
    return {
        ctx: ctx,
        stroke: gradientStroke,
        fill: gradientFill,
    };
}

function getUsersGradients() {
    let canvas = document.getElementById('usersChart');
    let ctx = canvas.getContext('2d');
    let gradientStroke =
        ctx.createLinearGradient(0, 0, canvas.clientWidth, 0);
    gradientStroke.addColorStop(0, '#F1C40F');
    gradientStroke.addColorStop(1, '#2ECC71');
    let gradientFill =
        ctx.createLinearGradient(0, 0, 0, canvas.clientHeight);
    gradientFill.addColorStop(0, 'rgba(134, 200, 68, 0.8)');
    gradientFill.addColorStop(0.75, 'rgba(134, 200, 68, 0.0)');
    return {
        ctx: ctx,
        stroke: gradientStroke,
        fill: gradientFill,
    };
}

function widthChange(mq) {
    if (mq.matches) {
        window.tokenChart.options.legend.position = 'right';
        window.tokenChart.options.legend.display = true;
    } else {
        window.tokenChart.options.legend.display = false;
    }
    window.tokenChart.update();
}

function addSpaces(nStr) {
    nStr += '';
    let x = nStr.split('.');
    let x1 = x[0];
    let x2 = x.length > 1 ? '.' + x[1] : '';
    let rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ' ' + '$2');
    }
    return x1 + x2;
}

function setResizeHandler(callback, timeout) {
    let timerId = undefined;
    window.addEventListener('resize', function() {
        if (timerId != undefined) {
            clearTimeout(timerId);
            timerId = undefined;
        }
        timerId = setTimeout(function() {
            timerId = undefined;
            callback();
        }, timeout);
    });
}

function toDate(dateStr) {
    let arr = dateStr.split('.')
    return new Date(arr[2], arr[1] - 1, arr[0])
}