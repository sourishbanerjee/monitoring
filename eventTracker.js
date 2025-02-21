(function() {
    console.log('EventTracker.js loaded in Classic');
    var endpoint = 'https://webhook-test.com/f7cf3f838d1b1f31d41a70d5f2cd063d'; 

    function sendEvent(data) {
        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(function(response) {
            console.log('Event sent successfully:', data);
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

    function getDomPath(el) {
        var stack = [];
        while (el.parentNode != null) {
            var sibCount = 0;
            var sibIndex = 0;
            for (var i = 0; i < el.parentNode.childNodes.length; i++) {
                var sib = el.parentNode.childNodes[i];
                if (sib.nodeName == el.nodeName) {
                    if (sib === el) {
                        sibIndex = sibCount;
                    }
                    sibCount++;
                }
            }
            if (el.hasAttribute('id') && el.id != '') {
                stack.unshift(el.nodeName + '#' + el.id);
                break;
            } else if (sibCount > 1) {
                stack.unshift(el.nodeName + ':nth-of-type(' + (sibIndex + 1) + ')');
            } else {
                stack.unshift(el.nodeName);
            }
            el = el.parentNode;
        }
        return stack.join(' > ');
    }

    function clickHandler(event) {
        var clickedElement = event.target;
        var elementTag = clickedElement.tagName;
        var elementId = clickedElement.id || 'No ID';
        var elementClass = clickedElement.className || 'No Class';
        var elementText = clickedElement.textContent.trim() || 'No Text';
        var href = (clickedElement.tagName === 'A') ? clickedElement.href || 'No href' : '';
        var domPath = getDomPath(clickedElement);

        var clickData = {
            event: 'click',
            tag: elementTag,
            id: elementId,
            class: elementClass,
            text: elementText,
            href: href,
            domPath: domPath,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userId: getUserId()
        };
        console.log('Click event captured!', clickData);
        sendEvent(clickData);
    }

    function attachClickListener(doc) {
        if (doc) {
            doc.addEventListener('click', clickHandler);
        }
    }

    window.addEventListener('load', function() {
        var pageData = {
            event: 'page_view',
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userId: getUserId()
        };
        sendEvent(pageData);
        attachClickListener(document);
        startMutationObserver();
    });

    window.addEventListener('beforeunload', function() {
        var unloadData = {
            event: 'page_unload',
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userId: getUserId()
        };
        sendEvent(unloadData);
    });

    function startMutationObserver() {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeName === 'IFRAME') {
                            node.addEventListener('load', function() {
                                try {
                                    attachClickListener(node.contentDocument);
                                } catch (e) {
                                    console.error('Failed to attach click listener to iframe:', e);
                                }
                            });
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Optional: Form field interactions (commented out)
    document.addEventListener('focus', function(event) {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            var fieldData = {
                event: 'field_focus',
                fieldType: event.target.type,
                fieldId: event.target.id || 'No ID',
                url: window.location.href,
                timestamp: new Date().toISOString(),
                userId: getUserId()
            };
            sendEvent(fieldData);
        }
    }, true);

    // Optional: Scroll tracking (commented out)
    // var scrollTimeout;
    // window.addEventListener('scroll', function() {
    //     clearTimeout(scrollTimeout);
    //     scrollTimeout = setTimeout(function() {
    //         var scrollData = {
    //             event: 'scroll',
    //             scrollY: window.scrollY,
    //             url: window.location.href,
    //             timestamp: new Date().toISOString(),
    //             userId: getUserId()
    //         };
    //         sendEvent(scrollData);
    //     }, 500);
    // });

})();
