/**
 * SVG Dot Generator
 * @author Ivo Monteiro
 */

/**
 * Dot Object
 */
var Dot = {
    options: null,
    dot_size: 15,
    pos_x: 0,
    pos_y: 0,
    colour: {
        r: 0,
        g: 0,
        b: 0
    },
    svg_obj: null,
    init: function (options) {
        this.options = options || {};
        $.each(this.options, function (key, val) {
            this[key] = val;
        })
        return this;
    },
    set_RandomColour: function (indexFromSet) {
        var self = this;
        var rndSum = Math.floor((Math.random() * 2));
        var newVal = 0;
        var randomIndex = Math.floor(Math.random() * colorSets[indexFromSet - 1].length);
        $.each(colorSets[indexFromSet - 1][randomIndex], function (ind, val) {

            if (rndSum == 0) {
                newVal = Math.floor(val + (val / 50))
            } else {
                newVal = Math.floor(val - (val / 50))
            }
            if (newVal > 255) newVal = 255;
            if (newVal < 0) newVal = 0;
            if (ind == "r") self.colour['r'] = newVal;
            if (ind == "g") self.colour['g'] = newVal;
            if (ind == "b") self.colour['b'] = newVal;

        });
    },
    render: function (pattern, add, x, y) {
        this.pos_x = x;
        this.pos_y = y;

        this.set_RandomColour(pattern.indexFromSet);
        this.svg_obj = add.nested().circle(this.dot_size).move(this.pos_x, this.pos_y).fill(this.colour);

        return this;
    }
};

/**
 * Symbol Object
 */
var Symbol = {
    options: null,
    symbol_size: 0,
    icon_pos_x: 0,
    icon_pos_y: 0,
    icon_size: 36,
    pos_x: 0,
    pos_y: 0,
    init: function (options) {
        this.options = options || {};
        $.each(this.options, function (key, val) {
            this[key] = val;
        })
        return this;
    },
    render: function (pattern, add) {
        this.pos_x = pattern.offset * Math.floor(pattern.cols / 2) + pattern.padding;
        this.pos_y = pattern.padding;
        switch (pattern.indexFromSet) {
            case 1:
                this.svg_obj = add.nested().circle(this.symbol_size).fill("#133AB7").move(this.pos_x, this.pos_y);
                break;
            case 2:
                this.svg_obj = add.nested().circle(this.symbol_size).fill("#E30513").move(this.pos_x, this.pos_y);
                break;
            case 3:
                this.svg_obj = add.nested().circle(this.symbol_size).fill("#F7AB20").move(this.pos_x, this.pos_y);
                break;
            case 4:
                this.svg_obj = add.nested().circle(this.symbol_size).fill("#85C641").move(this.pos_x, this.pos_y);
                break;
            case 5:
                this.svg_obj = add.nested().circle(this.symbol_size).fill("#5BC1B4").move(this.pos_x, this.pos_y);
                break;
            case 6:
                this.svg_obj = add.nested().circle(this.symbol_size).fill("#D9008D").move(this.pos_x, this.pos_y);
                break;
            case 7:
                this.svg_obj = add.nested().circle(this.symbol_size).fill("#AA0022").move(this.pos_x, this.pos_y);
                break;
            case 8:
                this.svg_obj = add.nested().circle(this.symbol_size).fill("#03007E").move(this.pos_x, this.pos_y);
                break;

        }

        var self = this;
        this.icon_pos_x = this.pos_x + this.symbol_size / 2 - this.icon_size/2;
        this.icon_pos_y = this.symbol_size / 2 - this.icon_size/2 + pattern.padding;

        jQuery.ajax({
            url: 'imgs/symbol_icon.svg',

            dataType: 'xml',
            method: "GET",
            success: function (data) {

                var svg = $(data).find("svg")[0].outerHTML.replace(/stroke:#.{6};/, "stroke:#ffffff;");

                add.nested().svg(svg, function () {
                    if (this.type == 'svg') {
                        this.attr('width', null)
                        this.attr('height', null)
                        this.attr('viewBox', null)
                    }
                });
                var icon = add.last();
                icon.size(self.icon_size, self.icon_size).move(self.icon_pos_x, self.icon_pos_y).last().fill("#FFF");

            },
            error: function (data, data1) {
                console.log("error", data, data1);
            }

        });
    }
};


/**
 * Pattern Object that aggregates Dots and this.symbol
 */
var Pattern = {
    options: null,
    dots: [],
    dot_size: 15,
    offset: 0,
    padding: 0,
    rows: 0,
    cols: 0,
    width: 0,
    height: 0,
    colour: {
        r: 0,
        g: 0,
        b: 0
    },
    has_symbol: false,
    symbol: null,
    symbol_size_in_cols: 0,
    viewport: null,
    svg_obj: null,
    indexFromSet: 1,
    init: function (options) {
        this.options = options || {};
        $.each(this.options, function (key, val) {
            this[key] = val;
        });
        this.render_dots_with_symbol = this.render_dots_with_symbol.bind(this, arguments);
        return this;
    },
    set_viewport: function (stage) {
        this.viewport = stage.viewport;
        this.width = stage.dom.width() - this.padding;
        this.height = stage.dom.height() - this.padding;

    },
    render: function () {
        if (this.has_symbol) return this.render_with_symbol();
        var self = this;

        this.svg_obj = stage.drawing.pattern(pattern.width, pattern.height, function (add) {
            for (var j = 0; j < self.rows; j++) {
                for (var i = 0; i < self.cols; i++) {
                    var x = self.offset * i + self.padding;
                    var y = self.offset * j + self.padding;
                    self.dots[j][i].render(self, add, x, y);
                }
            }
        });

        return this.svg_obj;

    },
    render_with_symbol: function () {
        if (!this.svg_obj)
            this.svg_obj = stage.drawing.pattern(this.width, this.height,this.render_dots_with_symbol.bind(this));
        else this.svg_obj.update(this.render_dots_with_symbol)

        return this.svg_obj;
    },
    render_dots_with_symbol: function (cb, add) {
        for (var j = 0; j < this.rows; j++) {
            for (var i = 0; i < Math.floor(this.cols / 2); i++) {
                var x = this.offset * i + this.padding;
                var y = this.offset * j + this.padding;
                this.dots[j][i].render(this, add, x, y);

            }
        }

        this.symbol.render(pattern, add);

        for (j = 0; j < this.rows; j++) {
            for (i = Math.floor(this.cols / 2); i < this.cols; i++) {
                var x = this.offset * (i + 1) + this.symbol.symbol_size - this.dot_size + this.padding;
                var y = this.offset * j + this.padding;
                this.dots[j][i].render(this, add, x, y)

            }
        }
    }

};

/**
 * Stage Object that controls viewport and drawing SVG Objects
 */
var Stage = {
    drawing: null,
    viewport: null,
    init: function () {
        if (!this.drawing)
            this.drawing = SVG('drawing').size('100%', '100%');
        if (!this.viewport)
            this.viewport = this.drawing.rect('100%', '100%').move(0, 0).fill("#FFF");
        this.dom = $("#drawing");

        return this;
    },
    fill: function (pattern) {

        this.viewport.attr({
            fill: pattern.svg_obj
        });
    }
};

function initialize() {
    pattern = new Object(Pattern).init({
        dot_size: 15,
        dots: [],
        has_symbol: false,
    });

    stage = new Object(Stage).init();

    pattern.set_viewport(stage);

    $("#wdt").attr("placeholder", $("#wdt").attr("placeholder") + ": " + pattern.width);
    $("#hgt").attr("placeholder", $("#hgt").attr("placeholder") + ": " + pattern.height);

}

function update() {

    pattern.padding = pattern.offset = (2 * pattern.dot_size) + (pattern.dot_size / 2);
    pattern.cols = Math.floor(pattern.width / (pattern.offset));
    pattern.rows = Math.floor(pattern.height / (pattern.offset));

    if (pattern.has_symbol) {

        pattern.symbol = new Object(Symbol).init();
        pattern.symbol.symbol_size = pattern.offset * pattern.rows - pattern.dot_size - (pattern.dot_size / 2);
        pattern.symbol_size_in_cols = Math.floor((pattern.symbol.symbol_size / 2) / pattern.cols + 1);

        pattern.cols = Math.floor((pattern.width - pattern.symbol.symbol_size) / pattern.offset);

    }
    pattern.dots = new Array();
    for (var j = 0; j < pattern.rows; j++) {
        pattern.dots[j] = new Array();
        for (var i = 0; i < pattern.cols; i++) {
            pattern.dots[j][i] = new Object(Dot);
        }
    }

    pattern.render();
    stage.fill(pattern);
}

var stage = null,
    pattern = null;

window.onload = (function () {

    // Initiatize pattern and stage
    initialize();
    update();

    $(window).resize(function () {

        pattern.width = $(this).width();
        update();
    });

    var loader = $("#loader").css({
        "width": "100%",
        "height": "100%",
        "position": "absolute",
        "background": "#fff",
        "z-index": 99
    }).hide();

    // On Click Color Set, update index of array of colorsets
    $(".random").on("click", function (fn) {

        pattern.indexFromSet = parseInt(($(this).attr("class").split(" ")[1]).split("_set")[1]);
        update();
        $(this).siblings().removeClass("selected");
        $(this).addClass("selected");
        return false;
    });

    /**
     * Update Dot Width and  and itself
     */
    $(".size").on("change", function () {

        pattern.dot_size = $(this).val();
        update();
    });

    /**
     * Update Pattern Width
     */
    $("#wdt").on("keyup blur change", function (event) {
        if (event.keyCode == "13" || event.type == "change" || event.type == "blur") {

            if (!$(this).val()) $(this).val(1400);
            pattern.width = $(this).val();
            $("#drawing").width(pattern.width);
            update();

        }
        return false;
    });

    /**
     * Update Pattern Height
     */
    $("#hgt").on("keyup blur change", function (event) {
        if (event.keyCode == "13" || event.type == "change" || event.type == "blur") {

            if (!$(this).val()) $(this).val(250);
            pattern.height = $(this).val();
            $("#drawing").height(pattern.height);
            update();

        }
    });

    /**
     * Add Symbol to Pattern and update pattern
     */
    $(".add_symbol").on("click", function () {

        pattern.has_symbol = $(this).is(':checked');
        update();
    });

    /**
     * Download Button: transform into base64 and send as file blob
     */
    $(".download").on("click", function () {

        var svg = stage.drawing.svg();

        var b64 = btoa(svg); // or use btoa if supported
        $(this).attr("href", "data:image/svg+xml;base64," + b64);

    });
});
