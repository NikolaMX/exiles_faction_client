// Exiles faction event panel.
//
// Mirrors the Haunted Mayhem eventboard: on the reworked main menu the left
// panel is a tabbed area (#left-panel-tabs with NEWS / RANKINGS). This injects a
// third tab — "EXILES" — next to them and shows the faction info there.
//
// Self-contained client mod: never edits start.html / start.css and never
// touches the base UI's Knockout observables. Tab switching is driven by an
// `exiles-tab-active` class on #left-panel (see exiles_board.css).
//
// Cross-mod cooperation: several mods may add a left-panel tab and each opens
// itself by default on scene load. A shared jQuery event ('extMenuOpen') lets
// whichever tab opens tell the others to close, so only one is ever open.

(function () {
    var TAB_ID = "exiles-event-tab-btn";
    var PANEL_ID = "exiles-event-tab";
    var ACTIVE_CLASS = "exiles-tab-active";
    var MENU_ID = "exiles";   // identity used in the shared extMenuOpen handshake

    var panelHtml =
        '<div class="exiles-event-header">' +
        '    <img src="coui://ui/mods/exiles_eventboard/img/exiles_backdrop3.png" />' +
        '</div>' +
        '<div class="exiles-event-body">' +
        '    <h1>Exiles</h1>' +
        '    <h3>A high-tech faction with mastery over teleportation and arc-weaponry</h3>' +
        '    <p>A brand-new faction built to stand alongside &mdash; and against &mdash; Bugs and Legion. The Exiles bring an entirely new way to wage planetary war.</p>' +
        '    <ul class="exiles-features">' +
        '        <li>100+ all-new units</li>' +
        '        <li>Fully compatible with Bugs &amp; Legion</li>' +
        '        <li>Unique mechanics: EMP, blink teleportation, invisibility &amp; mass transports</li>' +
        '        <li>Balanced for both competitive and casual play</li>' +
        '        <li>Full AI support</li>' +
        '        <li class="exiles-soon">Coming soon: scripted campaign skirmishes</li>' +
        '    </ul>' +
        '    <div class="exiles-button-set">' +
        '        <a href="#" onclick="openExternalLink(\'https://pa-pedia.com/faction/exiles\')" class="exiles-button">View Exiles Units</a>' +
        '        <a href="#" onclick="openExternalLink(\'https://discord.gg/4f2nqDkQz9\')" class="exiles-button">Join Exiles Discord</a>' +
        '        <a href="#" onclick="openExternalLink(\'https://www.patreon.com/hauntedmayhem\')" class="exiles-button">Support us on Patreon</a>' +
        '    </div>' +
        '    <div class="exiles-tagline">The Exiles have returned.</div>' +
        '</div>';

    function activate() {
        if (!$("#" + PANEL_ID).length) return;
        // Tell any other mod tabs to close, so only one custom tab is open.
        $(document).trigger("extMenuOpen", [MENU_ID]);
        $("#left-panel").addClass(ACTIVE_CLASS);
        $("#" + TAB_ID).addClass("left-tab-active");
    }

    function deactivate() {
        $("#left-panel").removeClass(ACTIVE_CLASS);
        $("#" + TAB_ID).removeClass("left-tab-active");
    }

    function build() {
        var $tabs = $("#left-panel-tabs");
        var $leftPanel = $("#left-panel");
        if (!$tabs.length || !$leftPanel.length) return false;

        if ($("#" + TAB_ID).length) {
            activate();
            return true;
        }

        // 1) Third tab, sized by the base .left-tab rules.
        var $tab = $('<div class="left-tab btn_std_ix" id="' + TAB_ID + '">EXILES</div>');
        $tab.on("click", function () { activate(); });
        $tabs.append($tab);

        // 2) Content panel, before the pinned footer.
        var $panel = $('<div id="' + PANEL_ID + '"></div>').html(panelHtml);
        var $footer = $leftPanel.children("#left-panel-footer");
        if ($footer.length) { $panel.insertBefore($footer); } else { $leftPanel.append($panel); }

        // 3) Any native left-panel tab or social icon click leaves the Exiles tab.
        $tabs.children(".left-tab").not("#" + TAB_ID).on("click", deactivate);
        $("#top-bar-social .social-btn").on("click", deactivate);

        // 4) Cooperate with other custom tabs: close when another one opens.
        $(document).off("extMenuOpen.exiles").on("extMenuOpen.exiles", function (e, id) {
            if (id !== MENU_ID) deactivate();
        });

        // 5) Open by default on every scene load.
        activate();
        return true;
    }

    if (!build()) {
        var tries = 0;
        var poll = setInterval(function () {
            if (build() || ++tries > 40) { clearInterval(poll); }
        }, 50);
    }
})();

// Opens an external link; called inline from the panel's buttons.
function openExternalLink(url) {
    engine.call('web.launchPage', url);
}
