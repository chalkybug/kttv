//********************************************************************************************************************************************
//*
//*  TableScroller
//*  creates a horizontal and vertical scrolling table with pinned row and column headers
//*
//*  element - the dom reference to the table that will be converted to a scrollable table
//*  options:
//*     width - the width of the table
//*     height - the height of the table
//*     pinnedRows - the number of pinned rows
//*     pinnedCols - the number of pinned columns
//*     container - the container id for the scrollable table
//*     removeOriginal - indicator for removing the orignal table
//*
//*  returns:
//*     ref {
//*         options - the original options used to configure the scroller
//*         corner - dom reference to corner frame
//*         cornerTable - dom reference to corner table
//*         scrollableColumns - dom reference to scrollable columns frame
//*         scrollableColumnsTable - dom reference to scrollable columns table
//*         scrollableRows - dom reference to scrollable rows frame
//*         scrollableRowsTable - dom reference to scrollable rows table
//*         scrollableWindow - dom reference to scrollable data frame
//*         scrollableWindowTable - dom reference to scrollable data table
//*     }
//*
//********************************************************************************************************************************************
(function () {

    if (!Object.assign) {
        Object.defineProperty(Object, 'assign', {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function (target) {
                'use strict';
                if (target === undefined || target === null) {
                    throw new TypeError('Cannot convert first argument to object');
                }

                var to = Object(target);
                for (var i = 1; i < arguments.length; i++) {
                    var nextSource = arguments[i];
                    if (nextSource === undefined || nextSource === null) {
                        continue;
                    }
                    nextSource = Object(nextSource);

                    var keysArray = Object.keys(nextSource);
                    for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                        var nextKey = keysArray[nextIndex];
                        var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                        if (desc !== undefined && desc.enumerable) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
                return to;
            }
        });
    }

    var cloneTableSection = function (table, rowStart, rowEnd, columnStart, columnEnd) {

        var cloneTable = table.cloneNode();
        cloneTable.removeAttribute("id");

        var rows = table.getElementsByTagName("tr");
        for (var i = rowStart; (rowEnd == -1 || i < rowEnd) && i < rows.length; i++) {
            var row = rows[i];
            var parent = row.parentNode;
            var parentName = parent.nodeName.toLowerCase();
            if (parentName != "table" && cloneTable.getElementsByTagName(parentName).length == 0) {
                parent = parent.cloneNode();
                cloneTable.appendChild(parent);
            }
            else {
                parent = cloneTable.getElementsByTagName(parentName)[0];
            }

            var cloneRow = row.cloneNode();
            var columns = row.getElementsByTagName("th");
            if (columns.length == 0)
                columns = row.getElementsByTagName("td");

            for (var j = columnStart; (columnEnd == -1 || j < columnEnd) && j < columns.length; j++) {
                cloneRow.appendChild(columns[j].cloneNode(true));
            }

            parent.appendChild(cloneRow);
        }

        return cloneTable;
    };

    var getWidth = function (element) {
        var cssWidth = getComputedStyle(element, null).getPropertyValue("width");
        return parseFloat(cssWidth.replace("px", ""));
    }

    var getHeight = function (element) {
        var cssHeight = getComputedStyle(element, null).getPropertyValue("height");
        return parseFloat(cssHeight.replace("px", ""));
    }

    var alignTableColumnWidths = function (table1, table2) {
        if (table1.childNodes.length > 0 && table2.childNodes.length > 0) {
            var table1Cells = table1.getElementsByTagName("tr")[0].getElementsByTagName("th");
            if (table1Cells.length == 0)
                table1Cells = table1.getElementsByTagName("tr")[0].getElementsByTagName("td");

            var table2Cells = table2.getElementsByTagName("tr")[0].getElementsByTagName("th");
            if (table2Cells.length == 0)
                table2Cells = table2.getElementsByTagName("tr")[0].getElementsByTagName("td");

            for (var i = 0; i < table1Cells.length; i++) {
                if (getWidth(table1Cells[i]) > getWidth(table2Cells[i])) {
                    table2Cells[i].style.width = getWidth(table1Cells[i]) + "px";
                }
                else {
                    table1Cells[i].style.width = getWidth(table2Cells[i]) + "px";
                }
            }
        }
    }

    this.TableScroller = function (element, options) {

        if (typeof element == undefined || element == null || element.nodeName.toLowerCase() != "table")
            throw "Invalid table element specified";

        if (typeof options == undefined || options == null) throw "Options must be specified";

        var defaults = {
            width: element.offsetWidth,
            height: element.offsetHeight,
            pinnedRows: 1,
            pinnedCols: 0,
            container: ""
        };

        options = Object.assign(defaults, options);

        var containerDiv = null;
        if (options.container == "") {
            var id = "tablescroller-1";
            containerDiv = document.createElement("div");
            containerDiv.setAttribute("id", id);

            options.container = "#" + id;
            element.parentNode.appendChild(containerDiv);
        }
        else {
            containerDiv = document.getElementById(options.container.substr(1));
        }

        containerDiv.style.width = options.width + "px";
        containerDiv.style.height = options.height + "px";

        var ref = {
            options: options,
            corner: null,
            cornerTable: null,
            scrollableColumns: null,
            scrollableColumnsTable: null,
            scrollableRows: null,
            scrollableRowsTable: null,
            scrollableWindow: null,
            scrollableWindowTable: null
        };

        // corner section window and table
        if (options.pinnedRows > 0 && options.pinnedCols > 0) {
            ref.corner = document.createElement("div");
            ref.corner.className = "corner-frame";
            ref.cornerTable = cloneTableSection(element, 0, options.pinnedRows, 0, options.pinnedCols);
            ref.cornerTable.className = ref.cornerTable.className + " corner-table";
            containerDiv.appendChild(ref.corner);
            ref.corner.appendChild(ref.cornerTable);
        }

        // scrollable columns window and table
        if (options.pinnedRows > 0) {
            ref.scrollableColumns = document.createElement("div");
            ref.scrollableColumns.className = "scrollable-columns-frame";
            ref.scrollableColumnsTable = cloneTableSection(element, 0, options.pinnedRows, options.pinnedCols, -1);
            ref.scrollableColumnsTable.className = ref.scrollableColumnsTable.className + " scrollable-columns-table";
            containerDiv.appendChild(ref.scrollableColumns);
            ref.scrollableColumns.appendChild(ref.scrollableColumnsTable);
        }

        // scrollable rows window and table
        if (options.pinnedCols > 0) {
            ref.scrollableRows = document.createElement("div");
            ref.scrollableRows.className = "scrollable-rows-frame";
            ref.scrollableRowsTable = cloneTableSection(element, options.pinnedRows, -1, 0, options.pinnedCols);
            ref.scrollableRowsTable.className = ref.scrollableRowsTable.className + " scrollable-rows-table";
            containerDiv.appendChild(ref.scrollableRows);
            ref.scrollableRows.appendChild(ref.scrollableRowsTable);
        }

        ref.scrollableWindow = document.createElement("div");
        ref.scrollableWindow.className = "scrollable-data-frame";
        ref.scrollableWindowTable = cloneTableSection(element, options.pinnedRows, -1, options.pinnedCols, -1);
        ref.scrollableWindowTable.className = ref.scrollableWindowTable.className + " scrollable-data-table";
        containerDiv.appendChild(ref.scrollableWindow);
        ref.scrollableWindow.appendChild(ref.scrollableWindowTable);

        // adjust scrollable rows column widths
        if (ref.corner != null) {
            alignTableColumnWidths(ref.cornerTable, ref.scrollableRowsTable);
        }

        //adjust scrollable columns window width
        if (ref.scrollableColumnsTable != null) {
            var scwWidth = getWidth(ref.scrollableColumnsTable);
            if (scwWidth > getWidth(ref.scrollableWindowTable)) ref.scrollableWindowTable.style.width = getWidth(ref.scrollableColumnsTable) + "px";
            else ref.scrollableColumnsTable.style.width = getWidth(ref.scrollableWindowTable) + "px";

            //adjust scrollable columns column widths
            alignTableColumnWidths(ref.scrollableColumnsTable, ref.scrollableWindowTable);
        }

        // adjust width
        var width = ref.scrollableRows != null ? options.width - getWidth(ref.scrollableRows) : options.width;
        ref.scrollableWindow.style.width = width + "px";

        // adjust height
        var height = ref.scrollableColumns != null ? options.height - getHeight(ref.scrollableColumns) : options.height;
        ref.scrollableWindow.style.height = height + "px";

        // update scrollable column window or scrollable row window as the user scrolls through the scrollable window
        ref.scrollableWindow.addEventListener("scroll", function () {
            if (options.pinnedRows > 0) ref.scrollableColumns.scrollLeft = ref.scrollableWindow.scrollLeft;
            if (options.pinnedCols > 0) ref.scrollableRows.scrollTop = ref.scrollableWindow.scrollTop;
        });

        var pinnedColsHeight = ref.corner != null ? getHeight(containerDiv) - getHeight(ref.corner) : 0;
        if (ref.scrollableColumns != null && pinnedColsHeight != 0 && pinnedColsHeight < getHeight(ref.scrollableColumns)) ref.scrollableColumns.style.height = pinnedColsHeight + "px";

        // adjust scrollable columns frame to scrollable window with scroll bar width
        if (ref.scrollableColumns != null) {
            var scrollbarWidth = ref.scrollableWindow.offsetWidth - ref.scrollableWindow.clientWidth;
            ref.scrollableColumns.style.width = (width - scrollbarWidth) + "px";
        }

        // adjust scrollable rows frame to scrollable window with scroll bar height
        if (ref.scrollableRows != null) {
            var scrollbarHeight = ref.scrollableWindow.offsetHeight - ref.scrollableWindow.clientHeight;
            ref.scrollableRows.style.height = (height - scrollbarHeight) + "px";
        }

        if (options.removeOriginal == true) {
            element.style.display = "none";
        }

        return ref;
    }
}());
