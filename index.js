'use strict';

var marked = require('marked'),
    highlight = require('highlight.js'),
    getRenderer = function (options) {
        return new marked.Renderer();
    },
    registerLanguageDefinitions = function () {
        highlight.registerLanguage('plain', function() {
            return { case_insensitive: true };
        });

        highlight.registerLanguage('cli', function() {
            return { case_insensitive: true };
        });
    };

registerLanguageDefinitions();

exports.enableHighlighting = function () {
    marked.setOptions({
        highlight: function (code, lang) {
            if (lang) {
                return highlight.highlight(lang, code).value;
            }

            return highlight.highlightAuto(code).value;
        }
    });
};

exports.enableBootstrapCompatibility = function () {
    getRenderer = function (options) {
        var renderer = new marked.Renderer(),
            existingTableRenderer = renderer.table,
            existingImageRenderer = renderer.image;

        renderer.table = function (header, body) {
            var content = existingTableRenderer(header, body);

            return content.replace('<table>', '<table class="table table-bordered table-striped table-hover">');
        };

        renderer.image = function (href, title, text) {
            var hrefIncludingBaseImageUrl = require('url').parse(href).protocol
                    ? href
                    : options.marked.imageUrl.replace('{imageUrl}', href),
                content = existingImageRenderer(hrefIncludingBaseImageUrl, title, text);

            return content.replace('<img src=', '<img class="img-thumbnail" src=');
        };

        return renderer;
    };
};

exports.parseMarkdownContent = function (markdownContent, options, callback) {
    marked(markdownContent, { renderer: getRenderer(options) }, function (err, content) {
        if (err) { throw err; }
        callback(content);
    });
};

exports.init = function (engine) {
    engine.loadContent = function (content, callback) {
        exports.parseMarkdownContent(content, engine.getOptions(), callback);
    };
};