function renderBlocklyCanvas(destination) {
    aleph = Blockly.svg.cloneNode(true);
    aleph.removeAttribute("width");
    aleph.removeAttribute("height");
    aleph.removeChild(aleph.children[0]);
    aleph.removeChild(aleph.children[1]);
    aleph.removeChild(aleph.children[1]);
    if (aleph.children[0].children[1].children[0] !== undefined) {
        aleph.children[0].removeChild(aleph.children[0].children[0]);
        aleph.children[0].children[0].removeAttribute("transform");
        aleph.children[0].children[0].children[0].removeAttribute("transform");
        var linkElm = document.createElementNS("http://www.w3.org/1999/xhtml", "style");
        linkElm.textContent = '.blocklyDraggable {}\
        .blocklySvg {\
          background-color: #fff;\
          border: 1px solid #ddd;\
          overflow: hidden;\
        }\
        .blocklyWidgetDiv {\
          display: none;\
          position: absolute;\
          z-index: 999;\
        }\
        .blocklyResizeSE {\
          cursor: se-resize;\
          fill: #aaa;\
        }\
        .blocklyResizeSW {\
          cursor: sw-resize;\
          fill: #aaa;\
        }\
        .blocklyResizeLine {\
          stroke: #888;\
          stroke-width: 1;\
        }\
        .blocklyHighlightedConnectionPath {\
          fill: none;\
          stroke: #fc3;\
          stroke-width: 4px;\
        }\
        .blocklyPathLight {\
          fill: none;\
          stroke-linecap: round;\
          stroke-width: 2;\
        }\
        .blocklySelected>.blocklyPath {\
          stroke: #fc3;\
          stroke-width: 3px;\
        }\
        .blocklySelected>.blocklyPathLight {\
          display: none;\
        }\
        .blocklyDragging>.blocklyPath,\
        .blocklyDragging>.blocklyPathLight {\
          fill-opacity: .8;\
          stroke-opacity: .8;\
        }\
        .blocklyDragging>.blocklyPathDark {\
          display: none;\
        }\
        .blocklyDisabled>.blocklyPath {\
          fill-opacity: .5;\
          stroke-opacity: .5;\
        }\
        .blocklyDisabled>.blocklyPathLight,\
        .blocklyDisabled>.blocklyPathDark {\
          display: none;\
        }\
        .blocklyText {\
          cursor: default;\
          fill: #fff;\
          font-family: sans-serif;\
          font-size: 11pt;\
        }\
        .blocklyNonEditableText>text {\
          pointer-events: none;\
        }\
        .blocklyNonEditableText>rect,\
        .blocklyEditableText>rect {\
          fill: #fff;\
          fill-opacity: .6;\
        }\
        .blocklyNonEditableText>text,\
        .blocklyEditableText>text {\
          fill: #000;\
        }\
        .blocklyEditableText:hover>rect {\
          stroke: #fff;\
          stroke-width: 2;\
        }\
        .blocklyBubbleText {\
          fill: #000;\
        }\
        .blocklySvg text {\
          user-select: none;\
          -moz-user-select: none;\
          -webkit-user-select: none;\
          cursor: inherit;\
        }\
        .blocklyHidden {\
          display: none;\
        }\
        .blocklyFieldDropdown:not(.blocklyHidden) {\
          display: block;\
        }\
        .blocklyTooltipBackground {\
          fill: #ffffc7;\
          stroke: #d8d8d8;\
          stroke-width: 1px;\
        }\
        .blocklyTooltipShadow,\
        .blocklyDropdownMenuShadow {\
          fill: #bbb;\
          filter: url(#blocklyShadowFilter);\
        }\
        .blocklyTooltipText {\
          fill: #000;\
          font-family: sans-serif;\
          font-size: 9pt;\
        }\
        .blocklyIconShield {\
          cursor: default;\
          fill: #00c;\
          stroke: #ccc;\
          stroke-width: 1px;\
        }\
        .blocklyIconGroup:hover>.blocklyIconShield {\
          fill: #00f;\
          stroke: #fff;\
        }\
        .blocklyIconGroup:hover>.blocklyIconMark {\
          fill: #fff;\
        }\
        .blocklyIconMark {\
          cursor: default !important;\
          fill: #ccc;\
          font-family: sans-serif;\
          font-size: 9pt;\
          font-weight: bold;\
          text-anchor: middle;\
        }\
        .blocklyWarningBody {\
        }\
        .blocklyMinimalBody {\
          margin: 0;\
          padding: 0;\
        }\
        .blocklyCommentTextarea {\
          background-color: #ffc;\
          border: 0;\
          margin: 0;\
          padding: 2px;\
          resize: none;\
        }\
        .blocklyHtmlInput {\
          border: none;\
          font-family: sans-serif;\
          font-size: 11pt;\
          outline: none;\
          width: 100%\
        }\
        .blocklyMutatorBackground {\
          fill: #fff;\
          stroke: #ddd;\
          stroke-width: 1;\
        }\
        .blocklyFlyoutBackground {\
          fill: #ddd;\
          fill-opacity: .8;\
        }\
        .blocklyColourBackground {\
          fill: #666;\
        }\
        .blocklyScrollbarBackground {\
          fill: #fff;\
          stroke: #e4e4e4;\
          stroke-width: 1;\
        }\
        .blocklyScrollbarKnob {\
          fill: #ccc;\
        }\
        .blocklyScrollbarBackground:hover+.blocklyScrollbarKnob,\
        .blocklyScrollbarKnob:hover {\
          fill: #bbb;\
        }\
        .blocklyInvalidInput {\
          background: #faa;\
        }\
        .blocklyAngleCircle {\
          stroke: #444;\
          stroke-width: 1;\
          fill: #ddd;\
          fill-opacity: .8;\
        }\
        .blocklyAngleMarks {\
          stroke: #444;\
          stroke-width: 1;\
        }\
        .blocklyAngleGauge {\
          fill: #f88;\
          fill-opacity: .8;  \
        }\
        .blocklyAngleLine {\
          stroke: #f00;\
          stroke-width: 2;\
          stroke-linecap: round;\
        }\
        .blocklyContextMenu {\
          border-radius: 4px;\
        }\
        .blocklyDropdownMenu {\
          padding: 0 !important;\
        }\
        .blocklyWidgetDiv .goog-option-selected .goog-menuitem-checkbox,\
        .blocklyWidgetDiv .goog-option-selected .goog-menuitem-icon {\
          background: url(blockly/media/sprites.png) no-repeat -48px -16px !important;\
        }\
        .blocklyToolboxDiv {\
          background-color: #ddd;\
          display: none;\
          overflow-x: visible;\
          overflow-y: auto;\
          position: absolute;\
        }\
        .blocklyTreeRoot {\
          padding: 4px 0;\
        }\
        .blocklyTreeRoot:focus {\
          outline: none;\
        }\
        .blocklyTreeRow {\
          line-height: 22px;\
          height: 22px;\
          padding-right: 1em;\
          white-space: nowrap;\
        }\
        .blocklyToolboxDiv[dir="RTL"] .blocklyTreeRow {\
          padding-right: 0;\
          padding-left: 1em !important;\
        }\
        .blocklyTreeRow:hover {\
          background-color: #e4e4e4;\
        }\
        .blocklyTreeSeparator {\
          border-bottom: solid #e5e5e5 1px;\
          height: 0px;\
          margin: 5px 0;\
        }\
        .blocklyTreeIcon {\
          background-image: url(blockly/media/sprites.png);\
          height: 16px;\
          vertical-align: middle;\
          width: 16px;\
        }\
        .blocklyTreeIconClosedLtr {\
          background-position: -32px -1px;\
        }\
        .blocklyTreeIconClosedRtl {\
          background-position: 0px -1px;\
        }\
        .blocklyTreeIconOpen {\
          background-position: -16px -1px;\
        }\
        .blocklyTreeSelected>.blocklyTreeIconClosedLtr {\
          background-position: -32px -17px;\
        }\
        .blocklyTreeSelected>.blocklyTreeIconClosedRtl {\
          background-position: 0px -17px;\
        }\
        .blocklyTreeSelected>.blocklyTreeIconOpen {\
          background-position: -16px -17px;\
        }\
        .blocklyTreeIconNone,\
        .blocklyTreeSelected>.blocklyTreeIconNone {\
          background-position: -48px -1px;\
        }\
        .blocklyTreeLabel {\
          cursor: default;\
          font-family: sans-serif;\
          font-size: 16px;\
          padding: 0 3px;\
          vertical-align: middle;\
        }\
        .blocklyTreeSelected  {\
          background-color: #57e !important;\
        }\
        .blocklyTreeSelected .blocklyTreeLabel {\
          color: #fff;\
        }\
        .blocklyWidgetDiv .goog-palette {\
          outline: none;\
          cursor: default;\
        }\
        .blocklyWidgetDiv .goog-palette-table {\
          border: 1px solid #666;\
          border-collapse: collapse;\
        }\
        .blocklyWidgetDiv .goog-palette-cell {\
          height: 13px;\
          width: 15px;\
          margin: 0;\
          border: 0;\
          text-align: center;\
          vertical-align: middle;\
          border-right: 1px solid #666;\
          font-size: 1px;\
        }\
        .blocklyWidgetDiv .goog-palette-colorswatch {\
          position: relative;\
          height: 13px;\
          width: 15px;\
          border: 1px solid #666;\
        }\
        .blocklyWidgetDiv .goog-palette-cell-hover .goog-palette-colorswatch {\
          border: 1px solid #FFF;\
        }\
        .blocklyWidgetDiv .goog-palette-cell-selected .goog-palette-colorswatch {\
          border: 1px solid #000;\
          color: #fff;\
        }\
        .blocklyWidgetDiv .goog-date-picker,\
        .blocklyWidgetDiv .goog-date-picker th,\
        .blocklyWidgetDiv .goog-date-picker td {\
          font: 13px Arial, sans-serif;\
        }\
        .blocklyWidgetDiv .goog-date-picker {\
          -moz-user-focus: normal;\
          -moz-user-select: none;\
          position: relative;\
          border: 1px solid #000;\
          float: left;\
          padding: 2px;\
          color: #000;\
          background: #c3d9ff;\
          cursor: default;\
        }\
        .blocklyWidgetDiv .goog-date-picker th {\
          text-align: center;\
        }\
        .blocklyWidgetDiv .goog-date-picker td {\
          text-align: center;\
          vertical-align: middle;\
          padding: 1px 3px;\
        }\
        .blocklyWidgetDiv .goog-date-picker-menu {\
          position: absolute;\
          background: threedface;\
          border: 1px solid gray;\
          -moz-user-focus: normal;\
          z-index: 1;\
          outline: none;\
        }\
        .blocklyWidgetDiv .goog-date-picker-menu ul {\
          list-style: none;\
          margin: 0px;\
          padding: 0px;\
        }\
        .blocklyWidgetDiv .goog-date-picker-menu ul li {\
          cursor: default;\
        }\
        .blocklyWidgetDiv .goog-date-picker-menu-selected {\
          background: #ccf;\
        }\
        .blocklyWidgetDiv .goog-date-picker th {\
          font-size: .9em;\
        }\
        .blocklyWidgetDiv .goog-date-picker td div {\
          float: left;\
        }\
        .blocklyWidgetDiv .goog-date-picker button {\
          padding: 0px;\
          margin: 1px 0;\
          border: 0;\
          color: #20c;\
          font-weight: bold;\
          background: transparent;\
        }\
        .blocklyWidgetDiv .goog-date-picker-date {\
          background: #fff;\
        }\
        .blocklyWidgetDiv .goog-date-picker-week,\
        .blocklyWidgetDiv .goog-date-picker-wday {\
          padding: 1px 3px;\
          border: 0;\
          border-color: #a2bbdd;\
          border-style: solid;\
        }\
        .blocklyWidgetDiv .goog-date-picker-week {\
          border-right-width: 1px;\
        }\
        .blocklyWidgetDiv .goog-date-picker-wday {\
          border-bottom-width: 1px;\
        }\
        .blocklyWidgetDiv .goog-date-picker-head td {\
          text-align: center;\
        }\
        .blocklyWidgetDiv td.goog-date-picker-today-cont {\
          text-align: center;\
        }\
        .blocklyWidgetDiv td.goog-date-picker-none-cont {\
          text-align: center;\
        }\
        .blocklyWidgetDiv .goog-date-picker-month {\
          min-width: 11ex;\
          white-space: nowrap;\
        }\
        .blocklyWidgetDiv .goog-date-picker-year {\
          min-width: 6ex;\
          white-space: nowrap;\
        }\
        .blocklyWidgetDiv .goog-date-picker-monthyear {\
          white-space: nowrap;\
        }\
        .blocklyWidgetDiv .goog-date-picker table {\
          border-collapse: collapse;\
        }\
        .blocklyWidgetDiv .goog-date-picker-other-month {\
          color: #888;\
        }\
        .blocklyWidgetDiv .goog-date-picker-wkend-start,\
        .blocklyWidgetDiv .goog-date-picker-wkend-end {\
          background: #eee;\
        }\
        .blocklyWidgetDiv td.goog-date-picker-selected {\
          background: #c3d9ff;\
        }\
        .blocklyWidgetDiv .goog-date-picker-today {\
          background: #9ab;\
          font-weight: bold !important;\
          border-color: #246 #9bd #9bd #246;\
          color: #fff;\
        }\
        .blocklyWidgetDiv .goog-menu {\
          background: #fff;\
          border-color: #ccc #666 #666 #ccc;\
          border-style: solid;\
          border-width: 1px;\
          cursor: default;\
          font: normal 13px Arial, sans-serif;\
          margin: 0;\
          outline: none;\
          padding: 4px 0;\
          position: absolute;\
          z-index: 20000;\
        }\
        .blocklyWidgetDiv .goog-menuitem {\
          color: #000;\
          font: normal 13px Arial, sans-serif;\
          list-style: none;\
          margin: 0;\
          padding: 4px 7em 4px 28px;\
          white-space: nowrap;\
        }\
        .blocklyWidgetDiv .goog-menuitem.goog-menuitem-rtl {\
          padding-left: 7em;\
          padding-right: 28px;\
        }\
        .blocklyWidgetDiv .goog-menu-nocheckbox .goog-menuitem,\
        .blocklyWidgetDiv .goog-menu-noicon .goog-menuitem {\
          padding-left: 12px;\
        }\
        .blocklyWidgetDiv .goog-menu-noaccel .goog-menuitem {\
          padding-right: 20px;\
        }\
        .blocklyWidgetDiv .goog-menuitem-content {\
          color: #000;\
          font: normal 13px Arial, sans-serif;\
        }\
        .blocklyWidgetDiv .goog-menuitem-disabled .goog-menuitem-accel,\
        .blocklyWidgetDiv .goog-menuitem-disabled .goog-menuitem-content {\
          color: #ccc !important;\
        }\
        .blocklyWidgetDiv .goog-menuitem-disabled .goog-menuitem-icon {\
          opacity: 0.3;\
          -moz-opacity: 0.3;\
          filter: alpha(opacity=30);\
        }\
        .blocklyWidgetDiv .goog-menuitem-highlight,\
        .blocklyWidgetDiv .goog-menuitem-hover {\
          background-color: #d6e9f8;\
          border-color: #d6e9f8;\
          border-style: dotted;\
          border-width: 1px 0;\
          padding-bottom: 3px;\
          padding-top: 3px;\
        }\
        .blocklyWidgetDiv .goog-menuitem-checkbox,\
        .blocklyWidgetDiv .goog-menuitem-icon {\
          background-repeat: no-repeat;\
          height: 16px;\
          left: 6px;\
          position: absolute;\
          right: auto;\
          vertical-align: middle;\
          width: 16px;\
        }\
        .blocklyWidgetDiv .goog-menuitem-rtl .goog-menuitem-checkbox,\
        .blocklyWidgetDiv .goog-menuitem-rtl .goog-menuitem-icon {\
          left: auto;\
          right: 6px;\
        }\
        .blocklyWidgetDiv .goog-option-selected .goog-menuitem-checkbox,\
        .blocklyWidgetDiv .goog-option-selected .goog-menuitem-icon {\
          background: url(//ssl.gstatic.com/editor/editortoolbar.png) no-repeat -512px 0;\
        }\
        .blocklyWidgetDiv .goog-menuitem-accel {\
          color: #999;\
          direction: ltr;\
          left: auto;\
          padding: 0 6px;\
          position: absolute;\
          right: 0;\
          text-align: right;\
        }\
        .blocklyWidgetDiv .goog-menuitem-rtl .goog-menuitem-accel {\
          left: 0;\
          right: auto;\
          text-align: left;\
        }\
        .blocklyWidgetDiv .goog-menuitem-mnemonic-hint {\
          text-decoration: underline;\
        }\
        .blocklyWidgetDiv .goog-menuitem-mnemonic-separator {\
          color: #999;\
          font-size: 12px;\
          padding-left: 4px;\
        }\
        .blocklyWidgetDiv .goog-menuseparator {\
          border-top: 1px solid #ccc;\
          margin: 4px 0;\
          padding: 0;\
        }';
        aleph.insertBefore(linkElm, aleph.firstChild);
        //$(aleph).find('rect').remove();
        var xml = new XMLSerializer().serializeToString(aleph)
            data = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));

        $(destination).attr('src', data);
    }
}