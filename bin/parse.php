<?php

$dir = dirname(__DIR__);
$svgFiles = glob($dir . "/icons/*.svg");
$c = count($svgFiles);
echo "processing $c icons\n";

$generateShapes = false;
$generateIcons = true;

$noFill = [
    'journal', 'files', 'dotCircle', 'dotSquare'
];
$shapes = [
    'circle',
    'square',
    // 'badge', // do manually
    // 'backspace',
    'bag',
    'bell',
    'bookmark',
    'bookmarks',
    'box2', // will be renamed "box"
    'bucket',
    'calendar',
    'cart',
    'chat',
    'chat-left',
    'chat-right',
    'chat-square',
    'clipboard',
    'cloud',
    'collection',
    'cup',
    'diamond',
    'display',
    // 'droplet', // manually
    'egg',
    'file',
    'file-earmark',
    'files', // no files-fill ?
    'folder',
    'heart',
    'heptagon',
    'hexagon',
    'house',
    'houses',
    'journal', // no journal-fill?
    'octagon',
    // 'patch',
    'pentagon',
    // 'postage',
    'shield',
    'triangle',
];

$icons = [
    'activity',
    'airplane',
    'alarm',
    'align-center',
    'align-top', // => align-side
    'alt',
    'archive',
    'arrow-90deg-up',
    'arrow-bar-up',
    'arrow-up',
    'arrow-clockwise',
    'arrow-counterclockwise',
    'arrow-down-up',
    'arrow-repeat',
    'arrows-collapse',
    'arrows-expand',
    'arrows-fullscreen',
    'arrows-move',
    'aspect-ratio',
    'asterisk',
    'award',
    // 'back',
    'ballon',
    'bandaid',
    'bank',
    'bell',
    'bicycle',
    'binoculars',
    'blockquote-left',
    'blockquote-right',
    'body-text',
    'book',
    'book-half',
    'bookshelf',
    'box',
    'box-arrow-up',
    'box-arrow-in-up',
    'boxes',
    'braces',
    'braces-asterisk',
    'briefcase',
    'brightness-high',
    'broadcast',
    'brush',
    'bug',
    'building',
    'buildings',
    'camera',
    'camera-video',
    'capslock',
    'capsule',
    'card-checklist',
    'card-heading',
    'card-image',
    'card-list',
    'card-text',
    'cash',
    'cast',
    'chevron-bar-contract',
    'chevron-bar-expand',
    'chevron-bar-up',
    'chevron-up',
    'chevron-compact-up',
    'chevron-contract',
    'chevron-expand',
    'chevron-double-up',
    'circle-half',
    'clock',
    'clock-history',
    'code',
    'code-slash',
    'coin',
    'command',
    'compass',
    'cone',
    'credit-card',
    'dash',
    'database',
    'download',
    'envelope',
    'envelope-open',
    'eraser',
    'escape',
    // 'exclamation',
    'eye',
    'eyeglasses',
    'fan',
    'fast-forward',
    'heart',
    'file-earmark-image',
    'filter',
    'film',
    'filter-left',
    'filter-right',
    'fingerprint',
    'fire',
    'flag',
    'fonts',
    'forward',
    // 'front',
    'fullscreen',
    'fullscreen-exit',
    'funnel',
    'gear',
    'gem',
    'geo-alt',
    'gift',
    'globe',
    'graph-down',
    'graph-up',
    'grid',
    'hammer',
    'hand-index',
    'hand-index-thumb',
    'hand-thumbs-up',
    'hash',
    'hdd',
    'hourglass',
    'image',
    'images',
    'inbox',
    'inboxes',
    'incognito',
    'infinity',
    'info',
    'key',
    'layers',
    'person',
    'lightbulb',
    'lighting',
    'link',
    'list',
    'list-check',
    'lock',
    'magic',
    'map',
    'mic',
    'moon',
    'music-note',
    'nut',
    'paperclip',
    'pass',
    'pause',
    'play',
    'pencil',
    'phone',
    'pin',
    'piggy-bank',
    'plug',
    'power',
    'question',
    'radioactive',
    'recycle',
    'rewind',
    'rocket',
    'rocket-takeoff',
    'rss',
    'save',
    'send',
    'share',
    'shift',
    'shuffle',
    'sliders',
    'star',
    'stars',
    'stickies',
    'sticky',
    'stopwatch',
    'tablet',
    'tag',
    'tags',
    'telephone',
    'terminal',
    'three-dots',
    'trash',
    'tree',
    'trophy',
    'truck',
    'tv',
    'unlock',
    'upload',
    'virus',
    'window',
    'x-diamond',
    'zoom-in',
    'zoom-out',
    // 'caret-up', // triangles are hard to center without tweaks
];

function camelCase($string, $dontStrip = [])
{
    return lcfirst(str_replace(' ', '', ucwords(preg_replace('/[^a-z0-9' . implode('', $dontStrip) . ']+/', ' ', $string))));
}

if ($generateIcons) {
    echo "Generating icons\n";
    $iconsData = [];
    $data = '';
    $data .= "const generatedIcons = {";
    foreach ($svgFiles as $icon) {
        $found = false;
        $filename = pathinfo($icon, PATHINFO_FILENAME);

        if (!in_array($filename, $icons)) {
            continue;
        }

        $filename = str_replace('-down-up', '-exchange', $filename);
        $filename = str_replace('-up', '', $filename);
        $filename = str_replace('-top', '-side', $filename);

        $camel = camelCase($filename);

        // echo "processing $icon\n";

        $content = file_get_contents($icon);

        preg_match_all('/d="(.*?)"/', $content, $matches);
        preg_match_all('/cx="(.*?)" cy="(.*?)" r="(.*?)"/', $content, $circles);

        $pathsMatches = $matches[1];
        foreach ($circles[0] as $circle) {
            $pathsMatches[] = $circle;
        }

        $paths = implode('|', $pathsMatches);

        $iconsData[$camel] = $pathsMatches;

        // Is there a fill ?
        $fillIcon = str_replace('.svg', '-fill.svg', $icon);
        if (is_file($fillIcon)) {
            $fillContent = file_get_contents($fillIcon);

            preg_match_all('/d="(.*?)"/', $fillContent, $matches);
            preg_match_all('/cx="(.*?)" cy="(.*?)" r="(.*?)"/', $fillContent, $circles);

            $pathsMatches = $matches[1];
            foreach ($circles[0] as $circle) {
                $pathsMatches[] = $circle;
            }

            $fillPaths = implode('|', $pathsMatches);
            $data .= "\n  $camel: [`$paths`, `$fillPaths`],";
        } else {
            $data .= "\n  $camel: [`$paths`],";
        }
    }

    $data .= "\n};\nexport default generatedIcons;\n";
    echo "Available icons: " . implode(", ", array_keys($iconsData)) . "\n";
    foreach ($iconsData as $k => $v) {
        echo "<c-i v=\"$k\"></c-i>\n";
    }

    file_put_contents($dir . "/src/icons.js", $data);
}
if ($generateShapes) {
    echo "Generating shapes\n";
    $data = '';
    $shapesData = [];
    $data .= "const generatedShapes = {";
    foreach ($svgFiles as $icon) {
        $found = false;
        $filename = pathinfo($icon, PATHINFO_FILENAME);

        $isFill = str_contains($filename, '-fill');
        $testName = str_replace('-fill', '', $filename);

        if (!in_array($testName, $shapes)) {
            continue;
        }

        $camel = camelCase($testName);
        $camel = str_replace('2', '', $camel);

        // echo "processing shape $icon\n";

        $content = file_get_contents($icon);

        preg_match_all('/d="(.*?)"/', $content, $matches);
        preg_match_all('/cx="(.*?)" cy="(.*?)" r="(.*?)"/', $content, $circles);

        $pathsMatches = $matches[1];
        foreach ($circles[0] as $circle) {
            $pathsMatches[] = $circle;
        }

        $paths = implode('|', $pathsMatches);

        $idx = $isFill ? 1 : 0;
        $shapesData[$camel][$idx] = $paths;
        // $data .= "\n  $camel: `$paths`,";
    }
    foreach ($shapesData as $name => $values) {
        if (count($values) == 2) {
            $data .= "\n  $name: [\n`$values[0]`,\n`$values[1]`\n],";
        } else if (count($values) == 1) {
            $data .= "\n  $name: [\n`$values[0]`\n],";
        }
    }
    $data .= "\n};\nexport default generatedShapes;\n";

    $extraShapes = [
        'badge',
        'backspace',
        'droplet',
        'patch',
        'dotCircle',
        'dotSquare',
        'sd',
        'sign',
    ];

    $allShapes = array_merge(array_keys($shapesData), $extraShapes);
    echo "Available shapes: " . implode(", ", $allShapes) . "\n";
    foreach ($allShapes as $k) {
        echo "<c-i v=\"alert $k\"></c-i>\n";
        echo "<c-i v=\"check $k\"></c-i>\n";
        echo "<c-i v=\"x $k\"></c-i>\n";
        if (!in_array($k, $noFill)) {
            echo "<c-i v=\"alert $k-fill\"></c-i>\n";
            echo "<c-i v=\"check $k-fill\"></c-i>\n";
            echo "<c-i v=\"x $k-fill\"></c-i>\n";
        }
    }

    file_put_contents($dir . "/src/shapes.js", $data);
}
