<?php

$dir = dirname(__DIR__);
$icons = glob($dir . "/icons/*.svg");
$c = count($icons);
echo "processing $c icons\n";

$ignore = [
    'off', 'letter',
    'bolt', 'cancel', 'check', 'code', 'cog',
    'discount', 'dollar', 'down', 'exclamation', 'heart', 'minus',
    'pause', 'pin', 'plus',
    'question', 'search', 'share', 'star', 'x',
    'repeat', 'stats', 'time', 'add'
];
foreach (range(0, 100) as $i) {
    $ignore[] = $i;
    $ignore[] = $i . "x";
    $ignore[] = "f" . $i;
}
foreach (range('a', 'z') as $i) {
    $ignore[] = $i;
}

$ignoredIcons = [
    '123',
];

$onlyIcons = [
    // Done manually
    // 'alert',
    'accessible',
    'activity',
    'address-book',
    'adjustments',
    'affiliate',
    'align-center',
    'align-justified',
    'align-left',
    'align-right',
    'analyze',
    'api-app',
    'apps',
    'archive',
    'armchair',
    'arrow-bar-up',
    'arrow-bar-to-up',
    // 'arrow-up-bar',
    'arrow-badge-up',
    'arrow-back',
    'arrow-big-up',
    'arrow-big-up-line',
    // 'arrow-curve-left',
    'arrow-forward-up',
    'arrow-up',
    'arrows-horizontal',
    'arrows-diff',
    'arrows-move-vertical',
    'arrows-up-down',
    'article',
    'asterisk', // et périls
    'at',
    'award',
    'badge',
    'badges',
    'ban',
    'barcode',
    'chevron-compact-up',
    'chevron-up',
    'chevrons-up',
    // 'arrow-move-up',
    'basket',
    'bell',
    'caret-up',
    'exclamation-mark',
    // We have our own duotoned version of this
    // 'calendar',
    'star',
];

$duotoned = [
    'M10 14a2 2 0 1 0 4 0a2 2 0 0 0 -4 0',
    'M18,5H6C4.9,5,4,5.9,4,7v4h16V7C20,5.9,19.1,5,18,5z',
    'M12 13m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0',
];

function camelCase($string, $dontStrip = [])
{
    return lcfirst(str_replace(' ', '', ucwords(preg_replace('/[^a-z0-9' . implode('', $dontStrip) . ']+/', ' ', $string))));
}

$dic = [];
$dupl = [];
$compressedIcons = [];

$data = '';
$data .= "const generatedIcons = {";
foreach ($icons as $icon) {
    $found = false;
    $filename = pathinfo($icon, PATHINFO_FILENAME);

    if (in_array($filename, $ignoredIcons)) {
        continue;
    }

    if (empty($onlyIcons)) {
        $parts = explode("-", $filename);
        array_shift($parts);
        foreach ($parts as $part) {
            if (in_array($part, $ignore)) {
                $found = true;
            }
        }
        if ($found) {
            continue;
        }
    }



    if (!empty($onlyIcons) && !in_array($filename, $onlyIcons)) {
        continue;
    }

    $filename = str_replace('/-up-down/', '-bi', $filename);
    $filename = preg_replace('/-up$/', '', $filename);
    $filename = preg_replace('/-left$/', '', $filename);
    $filename = preg_replace('/-vertical$/', '', $filename);

    $camel = camelCase($filename);

    $camel = str_replace('12', 'twelve', $camel);
    $camel = str_replace('24', 'twentyFour', $camel);
    $camel = str_replace('2', 'two', $camel);
    $camel = str_replace('360', 'threeSixty', $camel);
    $camel = str_replace('3', 'three', $camel);

    echo "processing $icon\n";

    $content = file_get_contents($icon);

    //     <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-brand-tidal" width="24" height="24" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    //     <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    //     <path d="M5.333 6l3.334 3.25l3.333 -3.25l3.333 3.25l3.334 -3.25l3.333 3.25l-3.333 3.25l-3.334 -3.25l-3.333 3.25l3.333 3.25l-3.333 3.25l-3.333 -3.25l3.333 -3.25l-3.333 -3.25l-3.334 3.25l-3.333 -3.25z"></path>
    //  </svg>


    $content = str_replace('d="M0 0h24v24H0z"', '', $content);
    preg_match_all('/d="(.*?)"/', $content, $matches);
    preg_match_all('/cx="(.*?)" cy="(.*?)" r="(.*?)"/', $content, $circles);

    $pathsMatches = $matches[1];
    foreach ($pathsMatches as $pm) {
        // It's a duplicated path
        if (in_array($pm, $dic)) {
            $dupl[] = $pm;
        } else {
            $dic[] = $pm;
        }
    }

    foreach ($pathsMatches as $idx => $pm) {
        if (in_array($pm, $duotoned)) {
            $pathsMatches[$idx] = "*$pm";
        }
    }
    foreach ($circles[0] as $circle) {
        $pathsMatches[] = $circle;
    }

    $paths = implode('|', $pathsMatches);

    $data .= "\n  $camel: `$paths`,";
    $compressedIcons[$camel] = $pathsMatches;
}

// $dupl = array_unique($dupl);
// $replacedKeys = [];
// $data = "";
// $data = "const dic = {";
// foreach ($dupl as $idx => $d) {
//     $data .= "\n'$idx': `$d`,";
// }
// $data .= "\n};\n";

// $data .= "const generatedIcons = {";
// foreach ($compressedIcons as $camel => $pathsMatches) {
//     $compressedPaths = [];
//     foreach ($pathsMatches as $pm) {
//         $idx = array_search($pm, $dupl);
//         if ($idx !== false) {
//             $compressedPaths[] = '${d[' . $idx . ']}';
//         } else {
//             $compressedPaths[] = $pm;
//         }
//     }
//     $paths = implode('|', $compressedPaths);
//     $data .= "\n$camel: `$paths`,";
// }

$data .= "\n};\nexport default generatedIcons;\n";

file_put_contents($dir . "/src/icons.js", $data);
