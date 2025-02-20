(function() {
    var endpoint = 'https://webhook.site/4c7260c9-3217-45fb-bd7c-dfd95babb0f0'; 

    function sendEvent(data) {
        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).catch(function(error) {
            console.error('Event tracking failed:', error);
        });
    }

    function getUserId() {
        var userId = localStorage.getItem('userId');
        if (!userId) {
            userId = 'user-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userId', userId);
        }
        return userId;
    }

    window.addEventListener('load', function() {
        var pageData = {
            event: 'page_view',
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userId: getUserId()
        };
        sendEvent(pageData);
        startMutationObserver();
    });

    document.addEventListener('click', function(event) {
        var clickedElement = event.target;
        var elementTag = clickedElement.tagName;
        var elementId = clickedElement.id || 'No ID';
        var elementClass = clickedElement.className || 'No Class';
        var elementText = clickedElement.textContent.trim() || 'No Text';
        var href = (clickedElement.tagName === 'A') ? clickedElement.href || 'No href' : '';

        var clickData = {
            event: 'click',
            tag: elementTag,
            id: elementId,
            class: elementClass,
            text: elementText,
            href: href,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userId: getUserId()
        };
        sendEvent(clickData);
    }, true);

    document.addEventListener('submit', function(event) {
        var formElement = event.target;
        var formId = formElement.id || 'No ID';
        var formAction = formElement.action || 'No Action';

        var formData = {
            event: 'form_submit',
            formId: formId,
            formAction: formAction,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userId: getUserId()
        };
        sendEvent(formData);
    }, true);

    document.addEventListener('play', function(event) {
        if (event.target.tagName === 'VIDEO') {
            var videoElement = event.target;
            var videoId = videoElement.id || 'No ID';
            var videoSrc = videoElement.src || 'No Src';

            var videoData = {
                event: 'video_play',
                videoId: videoId,
                videoSrc: videoSrc,
                url: window.location.href,
                timestamp: new Date().toISOString(),
                userId: getUserId()
            };
            sendEvent(videoData);
        }
    }, true);

    window.addEventListener('error', function(event) {
        var errorData = {
            event: 'error',
            message: event.message,
            url: event.filename,
            line: event.lineno,
            column: event.colno,
            stack: event.error ? event.error.stack : 'No Stack',
            timestamp: new Date().toISOString(),
            userId: getUserId()
        };
        sendEvent(errorData);
    });

    function startMutationObserver() {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                var mutationData = {
                    event: 'dom_mutation',
                    type: mutation.type,
                    targetTag: mutation.target.tagName || 'Unknown',
                    targetId: mutation.target.id || 'No ID',
                    targetClass: mutation.target.className || 'No Class',
                    url: window.location.href,
                    timestamp: new Date().toISOString(),
                    userId: getUserId()
                };

                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutationData.detail = 'Added ' + mutation.addedNodes.length + ' node(s)';
                } else if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                    mutationData.detail = 'Removed ' + mutation.removedNodes.length + ' node(s)';
                } else if (mutation.type === 'attributes') {
                    mutationData.detail = 'Attribute ' + mutation.attributeName + ' changed';
                }

                sendEvent(mutationData);
            });
        });

        observer.observe(document.body, {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true
        });
    }
})();
