function save_options() {
    var webhookUrl = document.getElementById('webhookUrl').value;
    chrome.storage.sync.set({
        webhookUrl: webhookUrl
    }, function () {
        var status = document.getElementById('status');
        status.textContent = 'Saved!';
        setTimeout(function () {
            status.textContent = '';
        }, 1500);
    });
}

function restore_options() {
    chrome.storage.sync.get({
        webhookUrl: ''
    }, function (items) {
        document.getElementById('webhookUrl').value = items.webhookUrl;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
