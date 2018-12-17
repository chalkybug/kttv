//********************************************************************************************************************************************
//*
//*  tablescroller
//*  creates a horizontal and vertical scrolling table with pinned row and column headers.
//*
//*  options:
//*     width - the width of the table
//*     height - the height of the table
//*     pinnedRows - the number of pinned rows
//*     pinnedCols - the number of pinned columns
//*     container - the container id for the scrollable table
//*     removeOriginal - indicator for removing the orignal table
//*
//********************************************************************************************************************************************
$.fn.tablescroller = function (options) {

    $(this).each(function (index, element) {

        var tableScroller = new TableScroller(element, options);
        $(element).data("tablesScrollerRef", tableScroller);
    });

    return this;
};
