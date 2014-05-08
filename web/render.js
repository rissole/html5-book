var ENTRY_TEMPL, FOREWORD_TEMPL, MYGAGS_TEMPL, PAGE_TEMPL, TITLE_TEMPL, TECHSPECS_TEMPL;

function loadTemplates(callback) {
    $.when(
        $.ajax('entry.htmpl'),
        $.ajax('foreword.htmpl'),
        $.ajax('mygags.htmpl'),
        $.ajax('page.htmpl'),
        $.ajax('title.htmpl'),
        $.ajax('techspecs.htmpl')
    ).done(function (e, f, m, p, t, ts) {
        ENTRY_TEMPL = e[0]
        FOREWORD_TEMPL = f[0];
        MYGAGS_TEMPL = m[0];
        PAGE_TEMPL = p[0];
        TITLE_TEMPL = t[0];
        TECHSPECS_TEMPL = ts[0];
        callback();
    });
}

function renderTitlePage(title, image) {
    var filled = TITLE_TEMPL.replace('%image%', image)
                            .replace('%title%', title);
    $('body').append(filled);
}

function renderNewPage() {
    var filled = PAGE_TEMPL;
    $('body').append(filled);
}

function renderBlankPage() {
    renderNewPage();
    $('.page:last').addClass('blank').html('');
}

function renderNode(node, level) {
    level = level || 0;

    // in my arbitarily defined protocol, data is in the form text||quote or just text.
    var data = node.data.split("||", 2);

    var filled = ENTRY_TEMPL.replace('%level%', level)
                            .replace('%text%', data[0]);
    
    // if there is a quote
    if (data.length > 1) {
        filled = filled.replace('%if_quote%', '')
                       .replace('%fi_quote%', '')
                       .replace('%quote%', data[1]);
    } else {
        filled = filled.replace(/%if_quote%[\s\S]*%fi_quote%/g, '');
    }

    pushToHierarchy(filled);
    
    $.each(node['children'], function(i, child) {
        renderNode(child, level+1);
    });
}

/* 
 * Push to the current hierarchy, 
 * marking filled/making new page as necessary
 *
 * !!justFilledColumn is for recursion only, never set!!
 */
function pushToHierarchy(html, justFilledColumn) {
    // just filled column is only 1 when we've made a new column
    justFilledColumn = justFilledColumn || false;
    var hier = getCurrentHierarchy();
    hier.append('<div id="temp">'+html+'</div>');
    var $temp = $('#temp');

    var sumHeights = sumOfHeights(hier.children());
    var height = hier.height();
    if (sumHeights >= height-50) {
        if (!justFilledColumn) {
            // if we can't fit this node on, and it's our first time trying to fit it,
            // just make a new page and attempt to fit it again.
            
            // mark column as filled
            hier.attr('filled', '1');
            // look if there's another column on this page
            hier = getCurrentHierarchy();
            if (hier.length == 0) {
                // make a new page if there isn't
                renderNewPage();
                hier = getCurrentHierarchy();
            }
            $temp.remove();
            // try again now that we've got a new page
            pushToHierarchy(html, true);
        } else {
            // if we can't fit, and it couldn't fit last attempt, make the quote font smaller iteratively until it does.
            // by default, the font size is inherited from body, so we get the initial size from there
            // rather than the p.quote that we're actually modifying.
            var fontSize = Number($('body').css('font-size').replace(/[^\d\.]/g, ''));
            // however, we need to check the p.quote too, if we've already changed the font size.
            if ($temp.find('p.quote')[0].style.fontSize) {
                fontSize = Number($temp.find('p.quote')[0].style.fontSize.replace(/[^\d\.]/g, ''));
            }
            $temp.find('p.quote')[0].style.fontSize = String(fontSize - 1) + 'px';
            html = $temp.html();
            $temp.remove();
            // Try adding it now with this new font size.
            pushToHierarchy(html, true);
        }
    } else {
        // If it does fit, slap it on.
        $temp.remove();
        hier.append(html);     
    }
}

// Gets the total height of all elements in the selection
function sumOfHeights(selection) {
    var sum = 0;
    selection.each(function() {
        sum += $(this).outerHeight(true);
    });
    return sum;
}

// Gets the next available page to place a node on
function getCurrentPage() {
    return $('.page:not(.page-title):last');
}

// Gets the next available column to place a node on
function getCurrentHierarchy() {
    return getCurrentPage().find('.hierarchy:not([filled]):first');
}

function getTotalPages() {
    return $('.page').length;
}

function getTitlePageImageName(title) {
    return 'title-'+title.toLowerCase().replace(/ /g,'')+'.jpg'
}

function render() {
    $.getJSON("../gags.json", function(tree) {
        renderForeword();
        $.each(tree, function(i, node) {
            // only render title pages on the left page
            var totalPages = getTotalPages();
            if (totalPages % 2 == 0) {
                renderBlankPage();
            }
            
            // don't use the quote if there is one
            var data = node.data.split("||", 2);
            renderTitlePage(data[0], getTitlePageImageName(data[0]));
            renderNewPage();
            renderNode(node);
        });
        renderMyGagsSection();
        renderTechSpecs();
        console.log('Rendered ' + $('.level:not(.level-0)').length + ' gags across ' + $('.page').length + ' pages.');
    });
}

function renderMyGagsSection() {
    var filled = MYGAGS_TEMPL;
    $('body').append(filled);
    var $halves = $('.my-gags-half');
    var $left = $('.my-gags-half.left');
    $halves.append('<hr/>');
    var hrHeight = $halves.find('hr:first').outerHeight(true);
    while (sumOfHeights($left.children('hr')) < $left.height()) {
        $halves.append('<hr/>');
    }
}

function renderForeword() {
    var filled = FOREWORD_TEMPL;
    $('body').append(filled);
}

function renderTechSpecs() {
    var filled = TECHSPECS_TEMPL;
    $('body').append(filled);
}

$(window).load(loadTemplates(render));
