#!/usr/bin/env node

/**
 * Markdown to HTML Converter
 * Simple markdown to HTML converter without external dependencies
 */

const fs = require('fs');
const path = require('path');

// Simple markdown parser
function parseMarkdown(markdown) {
    let html = markdown;

    // Escape HTML entities in code blocks first
    const codeBlocks = [];
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
        codeBlocks.push({ lang: lang || 'plaintext', code: escapeHtml(code.trim()) });
        return placeholder;
    });

    // Headers
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Lists
    html = html.replace(/^\*\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/^-\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

    // Wrap consecutive list items in ul/ol
    html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
        return '<ul>\n' + match + '</ul>\n';
    });

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr>');

    // Tables
    html = parseTable(html);

    // Paragraphs
    const lines = html.split('\n');
    const processed = [];
    let inParagraph = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line === '') {
            if (inParagraph) {
                processed.push('</p>');
                inParagraph = false;
            }
            processed.push('');
        } else if (line.match(/^<(h[1-6]|ul|ol|li|hr|table|pre|div)/)) {
            if (inParagraph) {
                processed.push('</p>');
                inParagraph = false;
            }
            processed.push(line);
        } else if (line.match(/<\/(h[1-6]|ul|ol|li|hr|table|pre|div)>$/)) {
            processed.push(line);
        } else {
            if (!inParagraph) {
                processed.push('<p>');
                inParagraph = true;
            }
            processed.push(line);
        }
    }

    if (inParagraph) {
        processed.push('</p>');
    }

    html = processed.join('\n');

    // Restore code blocks
    codeBlocks.forEach((block, index) => {
        const codeHtml = `<pre><code class="language-${block.lang}">${block.code}</code></pre>`;
        html = html.replace(`__CODE_BLOCK_${index}__`, codeHtml);
    });

    return html;
}

function parseTable(html) {
    const tableRegex = /(\|.+\|\n)+/g;

    return html.replace(tableRegex, (match) => {
        const rows = match.trim().split('\n');
        if (rows.length < 2) return match;

        let tableHtml = '<table>\n<thead>\n<tr>\n';

        // Header row
        const headers = rows[0].split('|').filter(cell => cell.trim());
        headers.forEach(header => {
            tableHtml += `<th>${header.trim()}</th>\n`;
        });
        tableHtml += '</tr>\n</thead>\n<tbody>\n';

        // Skip separator row (index 1)
        // Body rows
        for (let i = 2; i < rows.length; i++) {
            tableHtml += '<tr>\n';
            const cells = rows[i].split('|').filter(cell => cell.trim());
            cells.forEach(cell => {
                tableHtml += `<td>${cell.trim()}</td>\n`;
            });
            tableHtml += '</tr>\n';
        }

        tableHtml += '</tbody>\n</table>\n';
        return tableHtml;
    });
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function generateHtmlTemplate(title, content) {
    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <style>
        :root {
            --primary-color: #2563eb;
            --secondary-color: #64748b;
            --bg-light: #f8fafc;
            --bg-white: #ffffff;
            --text-primary: #1e293b;
            --text-secondary: #64748b;
            --border-color: #e2e8f0;
            --code-bg: #1e293b;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif, 'Noto Sans JP';
            line-height: 1.8;
            color: var(--text-primary);
            background-color: var(--bg-light);
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: var(--bg-white);
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        h1 {
            color: var(--primary-color);
            font-size: 2.5rem;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid var(--primary-color);
        }

        h2 {
            color: var(--primary-color);
            font-size: 2rem;
            margin-top: 40px;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid var(--border-color);
        }

        h3 {
            color: var(--text-primary);
            font-size: 1.5rem;
            margin-top: 30px;
            margin-bottom: 15px;
        }

        h4 {
            color: var(--text-primary);
            font-size: 1.25rem;
            margin-top: 25px;
            margin-bottom: 12px;
        }

        h5, h6 {
            color: var(--text-primary);
            margin-top: 20px;
            margin-bottom: 10px;
        }

        p {
            margin-bottom: 15px;
            line-height: 1.8;
        }

        a {
            color: var(--primary-color);
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        ul, ol {
            margin-bottom: 15px;
            padding-left: 30px;
        }

        li {
            margin-bottom: 8px;
        }

        code {
            background: var(--bg-light);
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 0.9em;
            color: #d63384;
        }

        pre {
            background: var(--code-bg);
            color: #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            margin-bottom: 20px;
        }

        pre code {
            background: transparent;
            padding: 0;
            color: inherit;
            font-size: 0.95em;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        th, td {
            border: 1px solid var(--border-color);
            padding: 12px;
            text-align: left;
        }

        th {
            background: var(--bg-light);
            font-weight: 600;
            color: var(--text-primary);
        }

        tr:nth-child(even) {
            background: #f8fafc;
        }

        hr {
            border: none;
            border-top: 2px solid var(--border-color);
            margin: 30px 0;
        }

        strong {
            font-weight: 600;
            color: var(--text-primary);
        }

        em {
            font-style: italic;
        }

        blockquote {
            border-left: 4px solid var(--primary-color);
            padding-left: 20px;
            margin: 20px 0;
            color: var(--text-secondary);
            font-style: italic;
        }

        .back-link {
            display: inline-block;
            margin-bottom: 20px;
            padding: 10px 20px;
            background: var(--primary-color);
            color: white;
            border-radius: 6px;
            text-decoration: none;
        }

        .back-link:hover {
            background: #1d4ed8;
            text-decoration: none;
        }

        @media print {
            body {
                background: white;
            }
            .container {
                box-shadow: none;
                padding: 20px;
            }
            .back-link {
                display: none;
            }
        }

        @media (max-width: 768px) {
            .container {
                padding: 20px;
            }
            h1 {
                font-size: 2rem;
            }
            h2 {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="index.html" class="back-link">← 引き継ぎ資料トップに戻る</a>
        ${content}
    </div>
</body>
</html>`;
}

// Main conversion function
function convertFile(inputPath, outputPath) {
    try {
        const markdown = fs.readFileSync(inputPath, 'utf8');
        const fileName = path.basename(inputPath, '.md');
        const title = fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        const htmlContent = parseMarkdown(markdown);
        const fullHtml = generateHtmlTemplate(title, htmlContent);

        fs.writeFileSync(outputPath, fullHtml, 'utf8');
        console.log(`✓ Converted: ${inputPath} → ${outputPath}`);
    } catch (error) {
        console.error(`✗ Error converting ${inputPath}:`, error.message);
    }
}

// Convert all markdown files in docs directory
function convertAllDocs() {
    const docsDir = path.join(__dirname, '..', 'docs');
    const files = fs.readdirSync(docsDir);

    let convertedCount = 0;

    files.forEach(file => {
        if (file.endsWith('.md')) {
            const inputPath = path.join(docsDir, file);
            const outputPath = path.join(docsDir, file.replace('.md', '.html'));
            convertFile(inputPath, outputPath);
            convertedCount++;
        }
    });

    console.log(`\n✓ Converted ${convertedCount} markdown files to HTML`);
    console.log(`\n→ Open docs/index.html in your browser to view the documentation`);
}

// Run the converter
if (require.main === module) {
    convertAllDocs();
}

module.exports = { parseMarkdown, convertFile, convertAllDocs };
