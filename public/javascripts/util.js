// finds the difference between two dates
function timeDifference(current, previous) {
    let msPerMinute = 60 * 1000;
    let msPerHour = msPerMinute * 60;
    let msPerDay = msPerHour * 24;
    let msPerMonth = msPerDay * 30;
    let msPerYear = msPerDay * 365;
    let elapsed = current - previous;
    if (elapsed < msPerMinute) {
        return Math.round(elapsed / 1000) + 's ago';
    } else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + 'm ago';
    } else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + 'h ago';
    } else if (elapsed < msPerMonth) {
        return Math.round(elapsed / msPerDay) + 'd ago';
    } else if (elapsed < msPerYear) {
        return Math.round(elapsed / msPerMonth) + 'mo ago';
    } else {
        return Math.round(elapsed / msPerYear) + 'yrs ago';
    }
}
