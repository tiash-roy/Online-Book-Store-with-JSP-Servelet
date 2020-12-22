/**
 * ====================================================================
 * About
 * ====================================================================
 * Sarissa is an ECMAScript library acting as a cross-browser wrapper for native XML APIs.
 * The library supports Gecko based browsers like Mozilla and Firefox,
 * Internet Explorer (5.5+ with MSXML3.0+), Konqueror, Safari and a little of Opera
 * @version 0.9.7.5
 * @author: Manos Batsis, mailto: mbatsis at users full stop sourceforge full stop net
 * ====================================================================
 * Licence
 * ====================================================================
 * Sarissa is free software distributed under the GNU GPL version 2 (see <a href="gpl.txt">gpl.txt</a>) or higher, 
 * GNU LGPL version 2.1 (see <a href="lgpl.txt">lgpl.txt</a>) or higher and Apache Software License 2.0 or higher 
 * (see <a href="asl.txt">asl.txt</a>). This means you can choose one of the three and use that if you like. If 
 * you make modifications under the ASL, i would appreciate it if you submitted those.
 * In case your copy of Sarissa does not include the license texts, you may find
 * them online in various formats at <a href="http://www.gnu.org">http://www.gnu.org</a> and 
 * <a href="http://www.apache.org">http://www.apache.org</a>.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY 
 * KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE 
 * WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE 
 * AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * <p>Sarissa is a utility class. Provides "static" methods for DOMDocument, 
 * DOM Node serialization to XML strings and other utility goodies.</p>
 * @constructor
 */
function Sarissa(){};
Sarissa.PARSED_OK = "Document contains no parsing errors";
Sarissa.PARSED_EMPTY = "Document is empty";
Sarissa.PARSED_UNKNOWN_ERROR = "Not well-formed or other error";
var _sarissa_iNsCounter = 0;
var _SARISSA_IEPREFIX4XSLPARAM = "";
var _SARISSA_HAS_DOM_IMPLEMENTATION = document.implementation && true;
var _SARISSA_HAS_DOM_CREATE_DOCUMENT = _SARISSA_HAS_DOM_IMPLEMENTATION && document.implementation.createDocument;
var _SARISSA_HAS_DOM_FEATURE = _SARISSA_HAS_DOM_IMPLEMENTATION && document.implementation.hasFeature;
var _SARISSA_IS_MOZ = _SARISSA_HAS_DOM_CREATE_DOCUMENT && _SARISSA_HAS_DOM_FEATURE;
var _SARISSA_IS_SAFARI = (navigator.userAgent && navigator.vendor && (navigator.userAgent.toLowerCase().indexOf("applewebkit") != -1 || navigator.vendor.indexOf("Apple") != -1));
var _SARISSA_IS_IE = document.all && window.ActiveXObject && navigator.userAgent.toLowerCase().indexOf("msie") > -1  && navigator.userAgent.toLowerCase().indexOf("opera") == -1;
if(!window.Node || !Node.ELEMENT_NODE){
    Node = {ELEMENT_NODE: 1, ATTRIBUTE_NODE: 2, TEXT_NODE: 3, CDATA_SECTION_NODE: 4, ENTITY_REFERENCE_NODE: 5,  ENTITY_NODE: 6, PROCESSING_INSTRUCTION_NODE: 7, COMMENT_NODE: 8, DOCUMENT_NODE: 9, DOCUMENT_TYPE_NODE: 10, DOCUMENT_FRAGMENT_NODE: 11, NOTATION_NODE: 12};
};

if(typeof XMLDocument == "undefined" && typeof Document !="undefined"){ XMLDocument = Document; } 

// IE initialization
if(_SARISSA_IS_IE){
    // for XSLT parameter names, prefix needed by IE
    _SARISSA_IEPREFIX4XSLPARAM = "xsl:";
    // used to store the most recent ProgID available out of the above
    var _SARISSA_DOM_PROGID = "";
    var _SARISSA_XMLHTTP_PROGID = "";
    var _SARISSA_DOM_XMLWRITER = "";
    /**
     * Called when the Sarissa_xx.js file is parsed, to pick most recent
     * ProgIDs for IE, then gets destroyed.
     * @private
     * @param idList an array of MSXML PROGIDs from which the most recent will be picked for a given object
     * @param enabledList an array of arrays where each array has two items; the index of the PROGID for which a certain feature is enabled
     */
    Sarissa.pickRecentProgID = function (idList){
        // found progID flag
        var bFound = false;
        for(var i=0; i < idList.length && !bFound; i++){
            try{
                var oDoc = new ActiveXObject(idList[i]);
                o2Store = idList[i];
                bFound = true;
            }catch (objException){
                // trap; try next progID
            };
        };
        if (!bFound) {
            throw "Could not retreive a valid progID of Class: " + idList[idList.length-1]+". (original exception: "+e+")";
        };
        idList = null;
        return o2Store;
    };
    // pick best available MSXML progIDs
    _SARISSA_DOM_PROGID = null;
    _SARISSA_THREADEDDOM_PROGID = null;
    _SARISSA_XSLTEMPLATE_PROGID = null;
    _SARISSA_XMLHTTP_PROGID = null;
    if(!window.XMLHttpRequest){
        /**
         * Emulate XMLHttpRequest
         * @constructor
         */
        XMLHttpRequest = function() {
            if(!_SARISSA_XMLHTTP_PROGID){
                _SARISSA_XMLHTTP_PROGID = Sarissa.pickRecentProgID(["Msxml2.XMLHTTP.6.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"]);
            };
            return new ActiveXObject(_SARISSA_XMLHTTP_PROGID);
        };
    };
    // we dont need this anymore
    //============================================
    // Factory methods (IE)
    //============================================
    // see non-IE version
    Sarissa.getDomDocument = function(sUri, sName){
        if(!_SARISSA_DOM_PROGID){
            _SARISSA_DOM_PROGID = Sarissa.pickRecentProgID(["Msxml2.DOMDocument.6.0", "Msxml2.DOMDocument.3.0", "MSXML2.DOMDocument", "MSXML.DOMDocument", "Microsoft.XMLDOM"]);
        };
        var oDoc = new ActiveXObject(_SARISSA_DOM_PROGID);
        // if a root tag name was provided, we need to load it in the DOM object
        if (sName){
            // create an artifical namespace prefix 
            // or reuse existing prefix if applicable
            var prefix = "";
            if(sUri){
                if(sName.indexOf(":") > 1){
                    prefix = sName.substring(0, sName.indexOf(":"));
                    sName = sName.substring(sName.indexOf(":")+1); 
                }else{
                    prefix = "a" + (_sarissa_iNsCounter++);
                };
            };
            // use namespaces if a namespace URI exists
            if(sUri){
                oDoc.loadXML('<' + prefix+':'+sName + " xmlns:" + prefix + "=\"" + sUri + "\"" + " />");
            } else {
                oDoc.loadXML('<' + sName + " />");
            };
        };
        return oDoc;
    };
    // see non-IE version   
    Sarissa.getParseErrorText = function (oDoc) {
        var parseErrorText = Sarissa.PARSED_OK;
        if(oDoc.parseError.errorCode != 0){
            parseErrorText = "XML Parsing Error: " + oDoc.parseError.reason + 
                "\nLocation: " + oDoc.parseError.url + 
                "\nLine Number " + oDoc.parseError.line + ", Column " + 
                oDoc.parseError.linepos + 
                ":\n" + oDoc.parseError.srcText +
                "\n";
            for(var i = 0;  i < oDoc.parseError.linepos;i++){
                parseErrorText += "-";
            };
            parseErrorText +=  "^\n";
        }
        else if(oDoc.documentElement == null){
            parseErrorText = Sarissa.PARSED_EMPTY;
        };
        return parseErrorText;
    };
    // see non-IE version
    Sarissa.setXpathNamespaces = function(oDoc, sNsSet) {
        oDoc.setProperty("SelectionLanguage", "XPath");
        oDoc.setProperty("SelectionNamespaces", sNsSet);
    };   
    /**
     * Basic implementation of Mozilla's XSLTProcessor for IE. 
     * Reuses the same XSLT stylesheet for multiple transforms
     * @constructor
     */
    XSLTProcessor = function(){
        if(!_SARISSA_XSLTEMPLATE_PROGID){
            _SARISSA_XSLTEMPLATE_PROGID = Sarissa.pickRecentProgID(["Msxml2.XSLTemplate.6.0", "MSXML2.XSLTemplate.3.0"]);
        };
        this.template = new ActiveXObject(_SARISSA_XSLTEMPLATE_PROGID);
        this.processor = null;
    };
    /**
     * Imports the given XSLT DOM and compiles it to a reusable transform
     * <b>Note:</b> If the stylesheet was loaded from a URL and contains xsl:import or xsl:include elements,it will be reloaded to resolve those
     * @argument xslDoc The XSLT DOMDocument to import
     */
    XSLTProcessor.prototype.importStylesheet = function(xslDoc){
        if(!_SARISSA_THREADEDDOM_PROGID){
            _SARISSA_THREADEDDOM_PROGID = Sarissa.pickRecentProgID(["MSXML2.FreeThreadedDOMDocument.6.0", "MSXML2.FreeThreadedDOMDocument.3.0"]);
            _SARISSA_DOM_XMLWRITER = Sarissa.pickRecentProgID(["Msxml2.MXXMLWriter.6.0", "Msxml2.MXXMLWriter.3.0", "MSXML2.MXXMLWriter", "MSXML.MXXMLWriter", "Microsoft.XMLDOM"]);
        };
        xslDoc.setProperty("SelectionLanguage", "XPath");
        xslDoc.setProperty("SelectionNamespaces", "xmlns:xsl='http://www.w3.org/1999/XSL/Transform'");
        // convert stylesheet to free threaded
        var converted = new ActiveXObject(_SARISSA_THREADEDDOM_PROGID);
        // make included/imported stylesheets work if exist and xsl was originally loaded from url
        if(xslDoc.url && xslDoc.selectSingleNode("//xsl:*[local-name() = 'import' or local-name() = 'include']") != null){
            converted.async = false;
            if (_SARISSA_THREADEDDOM_PROGID == "MSXML2.FreeThreadedDOMDocument.6.0") { 
                converted.setProperty("AllowDocumentFunction", true); 
                converted.resolveExternals = true; 
            }
            converted.load(xslDoc.url);
        } else {
            converted.loadXML(xslDoc.xml);
        };
        converted.setProperty("SelectionNamespaces", "xmlns:xsl='http://www.w3.org/1999/XSL/Transform'");
        var output = converted.selectSingleNode("//xsl:output");
        this.outputMethod = output ? output.getAttribute("method") : "html";
        this.template.stylesheet = converted;
        this.processor = this.template.createProcessor();
        // for getParameter and clearParameters
        this.paramsSet = new Array();
    };

    /**
     * Transform the given XML DOM and return the transformation result as a new DOM document
     * @argument sourceDoc The XML DOMDocument to transform
     * @return The transformation result as a DOM Document
     */
    XSLTProcessor.prototype.transformToDocument = function(sourceDoc){
        // fix for bug 1549749
        if(_SARISSA_THREADEDDOM_PROGID){
            this.processor.input=sourceDoc;
            var outDoc=new ActiveXObject(_SARISSA_DOM_PROGID);
            this.processor.output=outDoc;
            this.processor.transform();
            return outDoc;
        }
        else{
            this.processor.input = sourceDoc;
            var outDoc = new ActiveXObject(_SARISSA_DOM_XMLWRITER);
            this.processor.output = outDoc; 
            this.processor.transform();
            var oDoc = new ActiveXObject(_SARISSA_DOM_PROGID);
            oDoc.loadXML(outDoc.output+"");
            return oDoc;
        };
    };
    
    /**
     * Transform the given XML DOM and return the transformation result as a new DOM fragment.
     * <b>Note</b>: The xsl:output method must match the nature of the owner document (XML/HTML).
     * @argument sourceDoc The XML DOMDocument to transform
     * @argument ownerDoc The owner of the result fragment
     * @return The transformation result as a DOM Document
     */
    XSLTProcessor.prototype.transformToFragment = function (sourceDoc, ownerDoc) {
        this.processor.input = sourceDoc;
        this.processor.transform();
        var s = this.processor.output;
        var f = ownerDoc.createDocumentFragment();
        if (this.outputMethod == 'text') {
            f.appendChild(ownerDoc.createTextNode(s));
        } else if (ownerDoc.body && ownerDoc.body.innerHTML) {
            var container = ownerDoc.createElement('div');
            container.innerHTML = s;
            while (container.hasChildNodes()) {
                f.appendChild(container.firstChild);
            }
        }
        else {
            var oDoc = new ActiveXObject(_SARISSA_DOM_PROGID);
            if (s.substring(0, 5) == '<?xml') {
                s = s.substring(s.indexOf('?>') + 2);
            }
            var xml = ''.concat('<my>', s, '</my>');
            oDoc.loadXML(xml);
            var container = oDoc.documentElement;
            while (container.hasChildNodes()) {
                f.appendChild(container.firstChild);
            }
        }
        return f;
    };
    
    /**
     * Set global XSLT parameter of the imported stylesheet
     * @argument nsURI The parameter namespace URI
     * @argument name The parameter base name
     * @argument value The new parameter value
     */
    XSLTProcessor.prototype.setParameter = function(nsURI, name, value){
        // nsURI is optional but cannot be null 
        if(nsURI){
            this.processor.addParameter(name, value, nsURI);
        }else{
            this.processor.addParameter(name, value);
        };
        // update updated params for getParameter 
        if(!this.paramsSet[""+nsURI]){
            this.paramsSet[""+nsURI] = new Array();
        };
        this.paramsSet[""+nsURI][name] = value;
    };
    /**
     * Gets a parameter if previously set by setParameter. Returns null
     * otherwise
     * @argument name The parameter base name
     * @argument value The new parameter value
     * @return The parameter value if reviously set by setParameter, null otherwise
     */
    XSLTProcessor.prototype.getParameter = function(nsURI, name){
        nsURI = nsURI || "";
        if(this.paramsSet[nsURI] && this.paramsSet[nsURI][name]){
            return this.paramsSet[nsURI][name];
        }else{
            return null;
        };
    };
    /**
     * Clear parameters (set them to default values as defined in the stylesheet itself)
     */
    XSLTProcessor.prototype.clearParameters = function(){
        for(var nsURI in this.paramsSet){
            for(var name in this.paramsSet[nsURI]){
                if(nsURI){
                    this.processor.addParameter(name, null, nsURI);
                }else{
                    this.processor.addParameter(name, null);
                };
            };
        };
        this.paramsSet = new Array();
    };
}else{ /* end IE initialization, try to deal with real browsers now ;-) */
    if(_SARISSA_HAS_DOM_CREATE_DOCUMENT){
        /**
         * <p>Ensures the document was loaded correctly, otherwise sets the
         * parseError to -1 to indicate something went wrong. Internal use</p>
         * @private
         */
        Sarissa.__handleLoad__ = function(oDoc){
            Sarissa.__setReadyState__(oDoc, 4);
        };
        /**
        * <p>Attached by an event handler to the load event. Internal use.</p>
        * @private
        */
        _sarissa_XMLDocument_onload = function(){
            Sarissa.__handleLoad__(this);
        };
        /**
         * <p>Sets the readyState property of the given DOM Document object.
         * Internal use.</p>
         * @private
         * @argument oDoc the DOM Document object to fire the
         *          readystatechange event
         * @argument iReadyState the number to change the readystate property to
         */
        Sarissa.__setReadyState__ = function(oDoc, iReadyState){
            oDoc.readyState = iReadyState;
            oDoc.readystate = iReadyState;
            if (oDoc.onreadystatechange != null && typeof oDoc.onreadystatechange == "function")
                oDoc.onreadystatechange();
        };
        Sarissa.getDomDocument = function(sUri, sName){
            var oDoc = document.implementation.createDocument(sUri?sUri:null, sName?sName:null, null);
            if(!oDoc.onreadystatechange){
            
                /**
                * <p>Emulate IE's onreadystatechange attribute</p>
                */
                oDoc.onreadystatechange = null;
            };
            if(!oDoc.readyState){
                /**
                * <p>Emulates IE's readyState property, which always gives an integer from 0 to 4:</p>
                * <ul><li>1 == LOADING,</li>
                * <li>2 == LOADED,</li>
                * <li>3 == INTERACTIVE,</li>
                * <li>4 == COMPLETED</li></ul>
                */
                oDoc.readyState = 0;
            };
            oDoc.addEventListener("load", _sarissa_XMLDocument_onload, false);
            return oDoc;
        };
        if(window.XMLDocument){
            // do nothing
        }// TODO: check if the new document has content before trying to copynodes, check  for error handling in DOM 3 LS
        else if(SARISSA_HAS_DOM_FEATURE && !Document.prototype.load && document.implementation.hasFeature('LS', '3.0')){
            //Opera 9 may get the XPath branch which gives creates XMLDocument, therefore it doesn't reach here which is good
            /**
            * <p>Factory method to obtain a new DOM Document object</p>
            * @argument sUri the namespace of the root node (if any)
            * @argument sUri the local name of the root node (if any)
            * @returns a new DOM Document
            */
            Sarissa.getDomDocument = function(sUri, sName){
                var oDoc = document.implementation.createDocument(sUri?sUri:null, sName?sName:null, null);
                return oDoc;
            };
        }
        else {
            Sarissa.getDomDocument = function(sUri, sName){
                var oDoc = document.implementation.createDocument(sUri?sUri:null, sName?sName:null, null);
                // looks like safari does not create the root element for some unknown reason
                if(oDoc && (sUri || sName) && !oDoc.documentElement){
                    oDoc.appendChild(oDoc.createElementNS(sUri, sName));
                };
                return oDoc;
            };
        };
    };//if(_SARISSA_HAS_DOM_CREATE_DOCUMENT)
};
//==========================================
// Common stuff
//==========================================
if(!window.DOMParser){
    if(_SARISSA_IS_SAFARI){
        /*
         * DOMParser is a utility class, used to construct DOMDocuments from XML strings
         * @constructor
         */
        DOMParser = function() { };
        /** 
        * Construct a new DOM Document from the given XMLstring
        * @param sXml the given XML string
        * @param contentType the content type of the document the given string represents (one of text/xml, application/xml, application/xhtml+xml). 
        * @return a new DOM Document from the given XML string
        */
        DOMParser.prototype.parseFromString = function(sXml, contentType){
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET", "data:text/xml;charset=utf-8," + encodeURIComponent(sXml), false);
            xmlhttp.send(null);
            return xmlhttp.responseXML;
        };
    }else if(Sarissa.getDomDocument && Sarissa.getDomDocument() && Sarissa.getDomDocument(null, "bar").xml){
        DOMParser = function() { };
        DOMParser.prototype.parseFromString = function(sXml, contentType){
            var doc = Sarissa.getDomDocument();
            doc.loadXML(sXml);
            return doc;
        };
    };
};

if((typeof(document.importNode) == "undefined") && _SARISSA_IS_IE){
    try{
        /**
        * Implementation of importNode for the context window document in IE
        * @param oNode the Node to import
        * @param bChildren whether to include the children of oNode
        * @returns the imported node for further use
        */
        document.importNode = function(oNode, bChildren){
            var tmp;
            if(oNode.nodeName == "tbody" || oNode.nodeName == "tr"){
                tmp = document.createElement("table");
            }
            else if(oNode.nodeName == "td"){
                tmp = document.createElement("tr");
            }
            else if(oNode.nodeName == "option"){
                tmp = document.createElement("select");
            }
            else{
                tmp = document.createElement("div");
            };
            if(bChildren){
                tmp.innerHTML = oNode.xml ? oNode.xml : oNode.outerHTML;
            }else{
                tmp.innerHTML = oNode.xml ? oNode.cloneNode(false).xml : oNode.cloneNode(false).outerHTML;
            };
            return tmp.getElementsByTagName("*")[0];
        };
    }catch(e){ };
};
if(!Sarissa.getParseErrorText){
    /**
     * <p>Returns a human readable description of the parsing error. Usefull
     * for debugging. Tip: append the returned error string in a &lt;pre&gt;
     * element if you want to render it.</p>
     * <p>Many thanks to Christian Stocker for the initial patch.</p>
     * @argument oDoc The target DOM document
     * @returns The parsing error description of the target Document in
     *          human readable form (preformated text)
     */
    Sarissa.getParseErrorText = function (oDoc){
        var parseErrorText = Sarissa.PARSED_OK;
        if(!oDoc.documentElement){
            parseErrorText = Sarissa.PARSED_EMPTY;
        } else if(oDoc.documentElement.tagName == "parsererror"){
            parseErrorText = oDoc.documentElement.firstChild.data;
            parseErrorText += "\n" +  oDoc.documentElement.firstChild.nextSibling.firstChild.data;
        } else if(oDoc.getElementsByTagName("parsererror").length > 0){
            var parsererror = oDoc.getElementsByTagName("parsererror")[0];
            parseErrorText = Sarissa.getText(parsererror, true)+"\n";
        } else if(oDoc.parseError && oDoc.parseError.errorCode != 0){
            parseErrorText = Sarissa.PARSED_UNKNOWN_ERROR;
        };
        return parseErrorText;
    };
};
Sarissa.getText = function(oNode, deep){
    var s = "";
    var nodes = oNode.childNodes;
    for(var i=0; i < nodes.length; i++){
        var node = nodes[i];
        var nodeType = node.nodeType;
        if(nodeType == Node.TEXT_NODE || nodeType == Node.CDATA_SECTION_NODE){
            s += node.data;
        } else if(deep == true
                    && (nodeType == Node.ELEMENT_NODE
                        || nodeType == Node.DOCUMENT_NODE
                        || nodeType == Node.DOCUMENT_FRAGMENT_NODE)){
            s += Sarissa.getText(node, true);
        };
    };
    return s;
};
if(!window.XMLSerializer 
    && Sarissa.getDomDocument 
    && Sarissa.getDomDocument("","foo", null).xml){
    /**
     * Utility class to serialize DOM Node objects to XML strings
     * @constructor
     */
    XMLSerializer = function(){};
    /**
     * Serialize the given DOM Node to an XML string
     * @param oNode the DOM Node to serialize
     */
    XMLSerializer.prototype.serializeToString = function(oNode) {
        return oNode.xml;
    };
};

/**
 * strips tags from a markup string
 */
Sarissa.stripTags = function (s) {
    return s.replace(/<[^>]+>/g,"");
};
/**
 * <p>Deletes all child nodes of the given node</p>
 * @argument oNode the Node to empty
 */
Sarissa.clearChildNodes = function(oNode) {
    // need to check for firstChild due to opera 8 bug with hasChildNodes
    while(oNode.firstChild) {
        oNode.removeChild(oNode.firstChild);
    };
};
/**
 * <p> Copies the childNodes of nodeFrom to nodeTo</p>
 * <p> <b>Note:</b> The second object's original content is deleted before 
 * the copy operation, unless you supply a true third parameter</p>
 * @argument nodeFrom the Node to copy the childNodes from
 * @argument nodeTo the Node to copy the childNodes to
 * @argument bPreserveExisting whether to preserve the original content of nodeTo, default is false
 */
Sarissa.copyChildNodes = function(nodeFrom, nodeTo, bPreserveExisting) {
    if((!nodeFrom) || (!nodeTo)){
        throw "Both source and destination nodes must be provided";
    };
    if(!bPreserveExisting){
        Sarissa.clearChildNodes(nodeTo);
    };
    var ownerDoc = nodeTo.nodeType == Node.DOCUMENT_NODE ? nodeTo : nodeTo.ownerDocument;
    var nodes = nodeFrom.childNodes;
    if(typeof(ownerDoc.importNode) != "undefined")  {
        for(var i=0;i < nodes.length;i++) {
            nodeTo.appendChild(ownerDoc.importNode(nodes[i], true));
        };
    } else {
        for(var i=0;i < nodes.length;i++) {
            nodeTo.appendChild(nodes[i].cloneNode(true));
        };
    };
};

/**
 * <p> Moves the childNodes of nodeFrom to nodeTo</p>
 * <p> <b>Note:</b> The second object's original content is deleted before 
 * the move operation, unless you supply a true third parameter</p>
 * @argument nodeFrom the Node to copy the childNodes from
 * @argument nodeTo the Node to copy the childNodes to
 * @argument bPreserveExisting whether to preserve the original content of nodeTo, default is
 */ 
Sarissa.moveChildNodes = function(nodeFrom, nodeTo, bPreserveExisting) {
    if((!nodeFrom) || (!nodeTo)){
        throw "Both source and destination nodes must be provided";
    };
    if(!bPreserveExisting){
        Sarissa.clearChildNodes(nodeTo);
    };
    var nodes = nodeFrom.childNodes;
    // if within the same doc, just move, else copy and delete
    if(nodeFrom.ownerDocument == nodeTo.ownerDocument){
        while(nodeFrom.firstChild){
            nodeTo.appendChild(nodeFrom.firstChild);
        };
    } else {
        var ownerDoc = nodeTo.nodeType == Node.DOCUMENT_NODE ? nodeTo : nodeTo.ownerDocument;
        if(typeof(ownerDoc.importNode) != "undefined") {
           for(var i=0;i < nodes.length;i++) {
               nodeTo.appendChild(ownerDoc.importNode(nodes[i], true));
           };
        }else{
           for(var i=0;i < nodes.length;i++) {
               nodeTo.appendChild(nodes[i].cloneNode(true));
           };
        };
        Sarissa.clearChildNodes(nodeFrom);
    };
};

/** 
 * <p>Serialize any object to an XML string. All properties are serialized using the property name
 * as the XML element name. Array elements are rendered as <code>array-item</code> elements, 
 * using their index/key as the value of the <code>key</code> attribute.</p>
 * @argument anyObject the object to serialize
 * @argument objectName a name for that object
 * @return the XML serializationj of the given object as a string
 */
Sarissa.xmlize = function(anyObject, objectName, indentSpace){
    indentSpace = indentSpace?indentSpace:'';
    var s = indentSpace  + '<' + objectName + '>';
    var isLeaf = false;
    if(!(anyObject instanceof Object) || anyObject instanceof Number || anyObject instanceof String 
        || anyObject instanceof Boolean || anyObject instanceof Date){
        s += Sarissa.escape(""+anyObject);
        isLeaf = true;
    }else{
        s += "\n";
        var itemKey = '';
        var isArrayItem = anyObject instanceof Array;
        for(var name in anyObject){
            s += Sarissa.xmlize(anyObject[name], (isArrayItem?"array-item key=\""+name+"\"":name), indentSpace + "   ");
        };
        s += indentSpace;
    };
    return s += (objectName.indexOf(' ')!=-1?"</array-item>\n":"</" + objectName + ">\n");
};

/** 
 * Escape the given string chacters that correspond to the five predefined XML entities
 * @param sXml the string to escape
 */
Sarissa.escape = function(sXml){
    return sXml.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
};

/** 
 * Unescape the given string. This turns the occurences of the predefined XML 
 * entities to become the characters they represent correspond to the five predefined XML entities
 * @param sXml the string to unescape
 */
Sarissa.unescape = function(sXml){
    return sXml.replace(/&apos;/g,"'")
        .replace(/&quot;/g,"\"")
        .replace(/&gt;/g,">")
        .replace(/&lt;/g,"<")
        .replace(/&amp;/g,"&");
};
//   EOF
// Global Variables
// var timeout = null;

// TODO - use sarissa for standard XMLHttpRequest Support.


// AJAX-JSF AJAX-like library, for communicate with view Tree on server side.

// Modified by Alexander J. Smirnov to use as JSF AJAX-like components. 
if (!window.A4J) { window.A4J= {};}

A4J.AJAX = {};
// Test for re-evaluate Scripts in updated part. Opera do it.
A4J.AJAX._scriptEvaluated=false;
try{
	// Simulate same calls as on XmlHttp
	var oDomDoc = Sarissa.getDomDocument();
	var xmlString = "<html xmlns='http://www.w3.org/1999/xhtml'><sc"+"ript>A4J.AJAX._scriptEvaluated=true;</scr"+"ipt></html>";
	oDomDoc = (new DOMParser()).parseFromString(xmlString, "text/xml");
	var _script=document.importNode(oDomDoc.getElementsByTagName("script")[0],true);
	document.documentElement.appendChild(_script);
} catch(e){ /* Mozilla in XHTML mode not have innerHTML */ };

/**
 * XMLHttp transport class - incapsulate most of client-specifiv functions for call server requests.
 */
 A4J.AJAX.XMLHttpRequest = function(query){
 	this._query = query;
 }

A4J.AJAX.XMLHttpRequest.prototype = {
	_query : null,
	_timeout : 0,
	_timeoutID : null,
	onready : null,
	_parsingStatus : Sarissa.PARSED_EMPTY,
	_errorMessage : "XML Response object not set",
	_contentType : null,
	onerror : null,
	onfinish : null,
	options : {},
	domEvt : null,
	form : null,
	_request : null,
	_aborted : false,
	/**
	 * Call on request state change. If response completed without errors, call
	 * onreadystatechange function.
	 */
	_onReady : function(){
          		LOG.debug("Reqest state : "+this._parsingStatus );
		      	if (this._request.readyState == 4  ) {
          			LOG.debug("Reqest end with state 4, status : "+this._request.status );
		      		if(this._timeoutID){
		      			window.clearTimeout(this._timeoutID);
		      		}
		      		if(this._request.status == 200){
						try {
            				LOG.debug("Response  with content-type: "+ this.getResponseHeader('Content-Type'));
			            	LOG.debug("Full response content: ", this.getResponseText());
						} catch(e) {
				// IE Can throw exception for any responses
						};
		      			// Prepare XML, if exist.
		      			if(this._request.responseXML ){
			      			this._parsingStatus = Sarissa.getParseErrorText(this._request.responseXML);
			      			if(this._parsingStatus == Sarissa.PARSED_OK){
			      				Sarissa.setXpathNamespaces(this._request.responseXML,"xmlns='http://www.w3.org/1999/xhtml'");
			      			}
		      			}
		      			if(this.onready){
		      				this.onready(this);
		      			}
		      		} else if(this.onerror){
		      			this._errorMessage = "Reqest error, status : "+this._request.status +" " + this._request.statusText + "\n Message: " + this.getResponseHeader("Ajax-Error-Message");
		      			this.onerror(this);
		      		}
		      		if(this.onfinish){
		      			this.onfinish(this);
		      		}
//			      	this._request = undefined;
		      	}
	},
	setRequestTimeout : function(timeout){
		this._timeout = timeout;
	},
	/**
	 * Send request to server with parameters from query ( POST or GET depend on client type )
	 */
	send : function(){
 	this._request = new XMLHttpRequest();
 	var _this = this;
 	this._request.onreadystatechange =  function(){
 				if(_this._aborted){return;};
          		LOG.debug("Reqest state : "+_this._request.readyState );
		      	if (_this._request.readyState == 4  ) {
          			LOG.debug("Reqest end with state 4");
		      		if(_this._timeoutID){
		      			window.clearTimeout(_this._timeoutID);
		      		}
		      		if(_this._request.status == 200){
						try {
            				LOG.debug("Response  with content-type: "+ _this.getResponseHeader('Content-Type'));
			            	LOG.debug("Full response content: ", _this.getResponseText());
						} catch(e) {
				// IE Can throw exception for any responses
						};
		      			// Prepare XML, if exist.
		      			if(_this._request.responseXML ){
			      			_this._parsingStatus = Sarissa.getParseErrorText(_this._request.responseXML);
			      			if(_this._parsingStatus == Sarissa.PARSED_OK && Sarissa.setXpathNamespaces ){
			      				Sarissa.setXpathNamespaces(_this._request.responseXML,"xmlns='http://www.w3.org/1999/xhtml'");
			      			}
		      			}
		      			if(_this.onready){
		      				_this.onready(_this);
		      			}
		      		} else if(_this.onerror){
		      			_this._errorMessage = "Reqest error, status : "+_this._request.status +" " + _this._request.statusText + "\n Message: " + _this.getResponseHeader("Ajax-Error-Message");
		      			_this.onerror(_this,_this._request.status,_this._errorMessage);
		      		}
		      		if(_this.onfinish){
		      			_this.onfinish(_this);
		      		}
			      	_this = undefined;
		      	}
	}; //this._onReady;
    try{
    LOG.debug("Start XmlHttpRequest");
    this._request.open('POST', this._query.getActionUrl("") , true);
    // Query use utf-8 encoding for prepare urlencode data, force request content-type and charset.
    var contentType = "application/x-www-form-urlencoded; charset=UTF-8";
	this._request.setRequestHeader( "Content-Type", contentType); 
    } catch(e){
    	// Opera 7-8 - force get
    	LOG.debug("XmlHttpRequest not support setRequestHeader - use GET instead of POST");
    	this._request.open('GET', this._query.getActionUrl("")+"?"+this._query.getQueryString() , true);
    }
    // send data.
    this._request.send(this._query.getQueryString());
    if(this._timeout > 0){
    	this._timeoutID = window.setTimeout(function(){
   			LOG.warn("request stopped due to timeout");
   			if(!_this._aborted){
   				A4J.AJAX.onAbort(_this);
   			}
			_this._aborted=true;
    		_this._request.abort();
    		if(_this.onerror){
      			_this._errorMessage = "Request timeout";
		    	_this.onerror(_this,500,_this._errorMessage);
		    }
      		if(_this.onfinish){
      			_this.onfinish(_this);
      		}
		    _this._request=undefined;
	      	_this = undefined;
    	},this._timeout);
    }
	},
	
	abort: function(){
   			if(!this._aborted){
   				A4J.AJAX.onAbort(this);
   			}
		this._aborted=true;
		if(this._request){
			try{
				this._request.abort();
				if(this._timeoutID){
					window.clearTimeout(this._timeoutID);
				}
			} catch (e){
				LOG.warn("Exception for abort current request "+e.Message)
			}
		}
	},
	getResponseText : function(){
		return this._request.responseText;
	},
	getError : function(){
		return this._errorMessage;
	},
	getParserStatus : function(){
		return this._parsingStatus;
	},
	getContentType : function(){
		if(!this._contentType){
			var contentType = this.getResponseHeader('Content-Type');
			if(contentType){
				var i = contentType.indexOf(';');
				if( i >= 0 ){
					this._contentType = contentType.substring(0,i);
				} else {
					this._contentType = contentType;				
				}
			} else {
				this._contentType="text/html";
			}
		}
		return this._contentType;
	},
	getResponseHeader : function(name){
		var result;
		// Different behavior - for non-existing headers, Firefox throws exception,
		// IE return "" , 
		try{
			result = this._request.getResponseHeader(name);
			if(result == ""){
				result = undefined;
			}
		} catch(e) {
		}
		if(!result){
		// Header not exist or Opera <=8.0 error. Try to find <meta > tag with same name.
			LOG.debug("Header "+name+" not found, search in <meta>")
			if(this._parsingStatus == Sarissa.PARSED_OK){
				var metas = this.getElementsByTagName("meta");
				for(var i = 0; i < metas.length;i++){
					var meta = metas[i];
					LOG.debug("Find <meta name='"+meta.getAttribute('name')+"' content='"+meta.getAttribute('content')+"'>")
					if(meta.getAttribute("name") == name){
						result = meta.getAttribute("content");
						break;
					}
				}
			}
			
		}
		return result;
	},
	/**
	 * get elements with elementname in responseXML or, if present - in element.
	 */
	getElementsByTagName : function(elementname,element){
		if(!element){
			element = this._request.responseXML;
		}
		LOG.debug("search for elements by name '"+elementname+"' "+" in element "+element.nodeName);
   		var elements; 
	    try
	    {
	        elements = element.selectNodes(".//*[local-name()=\""+ 
	                                           elementname +"\"]");
			LOG.debug("selectNodes found "+elements.length);
	    }
	    catch (ex) {
			elements = element.getElementsByTagName(elementname);
			LOG.debug("getElementsByTagName found "+elements.length);	    	
	    }
//	    return document.getElementsByTagName(tagName);
//		elements = element.getElementsByTagNameNS("http://www.w3.org/1999/xhtml",elementname);
//		LOG.debug("getElementsByTagNameNS found "+elements.length);
		return elements;
	},
	/**
	 * Find element in response by ID. Since in IE response not validated, use selectSingleNode instead.
	 */
	getElementById : function(id){
		// first attempt - .getElementById.
		var oDoc = this._request.responseXML;
    	if(typeof(oDoc.getElementById) != 'undefined') {
			LOG.debug("call getElementById for id= "+id);
    		return  oDoc.getElementById(id);
    	} 
    	else if(typeof(oDoc.selectSingleNode) != "undefined") {
			LOG.debug("call selectSingleNode for id= "+id);
    		return oDoc.selectSingleNode("//*[@id='"+id+"']"); /* XPATH istead of ID */
    	}
    	// nodeFromID not worked since XML validation disabled by
    	// default for MS 
    	else if(typeof(oDoc.nodeFromID) != "undefined") {
			LOG.debug("call nodeFromID for id= "+id);
    		return oDoc.nodeFromID(id);
    	} 
		LOG.error("No functions for getElementById found ");
    	return null;
		
	},
	evalScripts : function(node){
			var newscripts = this.getElementsByTagName("script",node);
	        LOG.debug("Scripts in updated part count : " + newscripts.length);
			if( newscripts.length > 0 ){
		      window.setTimeout(function() {
		        for (var i = 0; i < newscripts.length; i++){
		          var newscript = Sarissa.getText( newscripts[i],true ) ; // TODO - Mozilla disable innerHTML in XML page ..."";
	    	      try {
	    		        LOG.debug("Evaluate script replaced area in document: ", newscript);
    			  		if (window.execScript) {
				      		window.execScript( newscript );
    			  		} else {
     	      				window.eval(newscript);
    			  		}
		        	  } catch(e){
		          		LOG.error("ERROR Evaluate script:  Error name: " + e.name + e.message?". Error message: "+e.message:"");
		          	  }
			    }
			    newscripts = null;
			  },50);
		    }
		
	},
	importNode : function(oNode){
            var tmp = document.createElement("div");
            var serializer = new XMLSerializer();
            tmp.innerHTML = serializer.serializeToString(oNode) ;
            return tmp.firstChild;
        },
	/**
	 * Update DOM element with given ID by element with same ID in parsed responseXML
	 */
	updatePagePart : function(id){
		var newnode = this.getElementById(id);
		if( ! newnode ) { LOG.error("New node for ID "+id+" is not present in response");return;}
		var oldnode = document.getElementById(id);
		if ( oldnode  ) {
			var anchor = oldnode.parentNode ;
    // need to check for firstChild due to opera 8 bug with hasChildNodes
			Sarissa.clearChildNodes(oldnode);
			if(oldnode.outerHTML){
   		        LOG.debug("Replace content of node by outerHTML()");
				oldnode.outerHTML = newnode.xml; 
			} else {
		    	var importednode ;
	    		importednode = window.document.importNode(newnode, true);
   		        LOG.debug("Replace content of node by replaceChild()");
				anchor.replaceChild(importednode,oldnode);
			} 
	// re-execute all script fragments in imported subtree...
	// TODO - opera 8 run scripts at replace content stage.
			if(!A4J.AJAX._scriptEvaluated){
				this.evalScripts(newnode);
			}
	        LOG.debug("Update part of page for Id: "+id + " successful");
		} else {
			LOG.warn("Node for replace by response with id "+id+" not found in document");
		}
		
	},
	
	appendNewHeadElements : function(){
        	  // Append scripts and styles to head, if not presented in page before.
        	  this._appendNewElements("script","src",["type","language","charset"]);
        	  this._appendNewElements("link","href",["type","rel","rev","media"]);		
	}, 
	
	_appendNewElements : function(tag,href,attributes){
		      var newscripts = this.getElementsByTagName(tag);
        	  var oldscripts = document.getElementsByTagName(tag);
        	  var head = document.getElementsByTagName("head")[0]||document.documentElement;
        	  for(var i=0 ; i<newscripts.length;i++){
        	  	 var element = newscripts[i];
        	  	 var src = element.getAttribute(href);
        	  	 if(src){
        	  	 	var exist = false;
        	  	 	LOG.debug("<"+tag+"> in response with src="+src);
        	  				for(var j = 0 ; j < oldscripts.length; j++){
        	  					if(src == oldscripts[j].getAttribute(href)){
        	  						LOG.debug("Such element exist in document");
        	  						exist = true;
        	  						break;
        	  					}
        	  				}
        	  		 if(!exist){
        	  		 	// var script = window.document.importNode(element,true); //
        	  		 	var script = document.createElement(tag);
        	  		 	script.setAttribute(href,src);
        	  		 	for(var j = 0 ; j < attributes.length; j++){
        	  		 		this._copyAttribute(element,script,attributes[j]);
        	  		 	}
        	  		 	LOG.debug("append element to document");
        	  		 	head.appendChild(script);
        	  		 }     	  	 	
        	  	 }
        	  }
		
	},
	
	_copyAttribute : function(src,dst,attr){
		var value = src.getAttribute(attr);
		if(value){
			dst.setAttribute(attr,value);
		}
	}

}
// eventsQueues for ajax submit events.
A4J.AJAX._eventsQueues={};
  
//Listeners should be notified
A4J.AJAX.Listener = function(onafterajax){
	this.onafterajax = onafterajax;
}

A4J.AJAX._listeners= new Array();
A4J.AJAX.AddListener = function(listener){
	A4J.AJAX._listeners.push(listener);	
}
A4J.AJAX.removeListeners = function(listener){
	A4J.AJAX._listeners = new Array();	
}
// pollers timerId's
A4J.AJAX._pollers = {};
/*
 * 
 * 
 */
A4J.AJAX.Poll =  function( containerId, form, options ) {
	options.onerror = function(){
		// For error, re-submit request.
		A4J.AJAX.Poll(containerId,form,options);
	}
	A4J.AJAX._pollers[options.pollId] = window.setTimeout(function(){
		A4J.AJAX._pollers[options.pollId]=undefined;
		A4J.AJAX.SubmitRequest(containerId,form,null,options);
	},options.pollinterval);
}

A4J.AJAX.StopPoll =  function( Id ) {
	if(A4J.AJAX._pollers[Id]){
		window.clearTimeout(A4J.AJAX._pollers[Id]);
		A4J.AJAX._pollers[Id] = undefined;
	}
}
  
// Submit or put in queue request. It not full queues - framework perform waiting only one request to same queue, new events simple replace last.
// If request for same queue already performed, replace with current parameters.
A4J.AJAX.Submit =  function( containerId, form, evt , options ) {
	var domEvt;
	evt = evt || window.event || null;
	if(evt){
		// Create copy of event object, since most of properties undefined outside of event capture.
		domEvt={};
		try {
		domEvt.target=evt.target;
		domEvt.srcElement=evt.srcElement;
		domEvt.type=evt.type;
		domEvt.altKey=evt.altKey;
		domEvt.button=evt.button;
		domEvt.clientX=evt.clientX;
		domEvt.clientY=evt.clientY;
		domEvt.ctrlKey=evt.ctrlKey;
		domEvt.keyCode=evt.keyCode;
		domEvt.modifiers=evt.modifiers;
		domEvt.pageX=evt.pageX;
		domEvt.pageY=evt.pageY;
		domEvt.screenX=evt.screenX;
		domEvt.screenY=evt.screenY;
		domEvt.shiftKey=evt.shiftKey;
		domEvt.which=evt.which;
		} catch(e){
			LOG.warn("Exception on clone event");
		}
		LOG.debug("Have Event "+domEvt+" with properties: target: "+domEvt.target+", srcElement: "+domEvt.srcElement+", type: "+domEvt.type);
	}
    if(options.eventsQueue){
      var eventsQueue =  A4J.AJAX._eventsQueues[options.eventsQueue];
       if( eventsQueue )   {
       		 var eventsCount = eventsQueue.options.eventsCount||1;
	         eventsQueue.wait=true;
	         eventsQueue.containerId=containerId;
	         eventsQueue.form=form;
	         eventsQueue.domEvt=domEvt;
	         eventsQueue.options=options;	         
	         eventsQueue.options.eventsCount = eventsCount+1;
	       if(options.ignoreDupResponses && eventsQueue.request){
		        LOG.debug("Abort uncompleted request in queue "+options.eventsQueue);
	       		eventsQueue.request.abort();
	       		eventsQueue.request=false;
	            eventsQueue.wait=false;
       	        if( options.requestDelay ){
		    		window.setTimeout(function() {
		        	LOG.debug("End delay waiting, make request in queue "+options.eventsQueue);
		    		A4J.AJAX.SubmiteventsQueue(A4J.AJAX._eventsQueues[options.eventsQueue]);
		    		},options.requestDelay);
	       			LOG.debug("Create new waiting for request in queue "+options.eventsQueue);
	       			return;
       	   		}
	       } else {
	         LOG.debug("Put new event to queue "+options.eventsQueue);
	         return;
	       }
       } else {
       	   var queue = { wait : false,  containerId : containerId , form : form, domEvt : domEvt, options : options};
	       A4J.AJAX._eventsQueues[options.eventsQueue] = queue;
       	   if( options.requestDelay ){
		    window.setTimeout(function() {
		        LOG.debug("End delay waiting, make request in queue "+options.eventsQueue);
		    	A4J.AJAX.SubmiteventsQueue(A4J.AJAX._eventsQueues[options.eventsQueue]);
		    },options.requestDelay);
	       LOG.debug("Event occurs, create waiting for request in queue "+options.eventsQueue);
	       return;
       	   }
       } 
   }
  A4J.AJAX.SubmitRequest( containerId, form, domEvt , options );
}

A4J.AJAX.SubmiteventsQueue =  function( eventsQueue ) {
	// Clear wait flag to avoid resend same request.
	 eventsQueue.wait=false;
	 A4J.AJAX.SubmitRequest( eventsQueue.containerId, eventsQueue.form ,eventsQueue.domEvt , eventsQueue.options );	 
}
  // Main request submitting functions.
  // parameters :
  // form - HtmlForm object for submit.
  // control - form element, called request, or, clientID for JSF view.
  // affected - Array of ID's for DOM Objects, updated after request. Override
  // list of updated areas in response.
  // statusID - DOM id request status tags.
  // oncomplete - function for call after complete request.
A4J.AJAX.SubmitRequest =  function( containerId, formId ,domEvt , options ) {
    // First - run onsubmit event for client-side validation.
	LOG.debug("NEW AJAX REQUEST !!! with form :"+formId );
//	var	form = A4J.AJAX.locateForm(event);
	var form = window.document.getElementById(formId) 
	if( (!form || form.nodeName.toUpperCase() != "FORM") && domEvt ) {
		var srcElement = domEvt.target||domEvt.srcElement||null;
		if(srcElement){
			form = A4J.AJAX.locateForm(srcElement);
		}
	}
	// TODO - test for null of form object
    if(form && form.onsubmit) {
		LOG.debug("Form have onsubmit function, call it" );
    	if( form.onsubmit() == false ){
    		return false;
    	}
    }
    var tosend = new A4J.Query(containerId, form);
    tosend.appendFormControls(options.single);
    if(options.control){
    	tosend.appendControl(options.control,true);
    }
    if(options.parameters){
    	tosend.appendParameters(options.parameters);
    }    
    if(options.eventsCount){
    	tosend.appendParameter("AJAX:EVENTS_COUNT",options.eventsCount);
    }    
    if(options.actionUrl){
    	tosend.setActionUrl(options.actionUrl);
    }
    // build  xxxHttpRequest. by Sarissa / JSHttpRequest class always defined.
    var req = new A4J.AJAX.XMLHttpRequest(tosend);
    
    req.options = options;
    req.containerId = containerId;
    req.domEvt = domEvt;
    req.form = form;
    if(options.timeout){
    	req.setRequestTimeout(options.timeout)
    }
    
    // Event handler for process response result.
    req.onready = A4J.AJAX.processResponse;
    
    if(options.onerror){
    	req.onerror = options.onerror;
    } else {
		req.onerror = A4J.AJAX.onError;
    }
	req.onfinish = A4J.AJAX.finishRequest;   

    A4J.AJAX.status(containerId,options.status,true);
    req.send();
    if(options.eventsQueue){
      var eventsQueue =  A4J.AJAX._eventsQueues[options.eventsQueue];
       if( eventsQueue )   {
       	  eventsQueue.request=req;
       }
    }
    
    return false;
  }

A4J.AJAX.onError = function(req,status,message) {
         // Status not 200 - error !!!! TODO - I18N ???
         	window.alert(message);
        };
        
A4J.AJAX.onAbort = function(req) {
       // mark status object ( if any ) for complete request ;
	     A4J.AJAX.status(req.containerId,req.options.status,false);
        };

A4J.AJAX.processResponse = function(req) {
    	    var options = req.options;
			var ajaxResponse = req.getResponseHeader('Ajax-Response');
          	if( ajaxResponse != "true"){
          	  	// NO Ajax header - new page.
          	  	LOG.warn("No ajax response header ");
         		var loc = req.getResponseHeader("Location");
	         	try{
	         		if(ajaxResponse == 'redirect' && loc){
						var expiredMsg = req.getResponseHeader('Ajax-Expired');
	         			if(expiredMsg){
	         				loc = A4J.AJAX.onExpired(loc,expiredMsg);
	         				if(!loc){
	         					return;
	         				}
	         			} 
	         			window.location = loc;
	         		} else if(ajaxResponse == "reload"){
       					window.location.reload(true);
	         		} else {
	         			var isIE = _SARISSA_IS_IE;
						window.setTimeout(function() {
							var isDocOpen=false;
							try {  	
		          				window.document.open(req.getContentType(),true);
		          				isDocOpen=true;
		          				window.document.write(req.getResponseText());
		          				window.document.close();
	          				if(isIE){
	          			// For Ie , scripts on page not activated.
	          					window.location.reload(false);
	          				}
							} catch(e) {
								if(isDocOpen){
		          					window.document.close();
								}
								// Firefox/Mozilla in XHTML case don't support document.write()
//								window.location = "data:"+req.getContentType()+";charset=utf-8," + encodeURIComponent(req.getResponseText())
								// Use dom manipulation instead.
								var	oDomDoc = (new DOMParser()).parseFromString(req.getResponseText(), "application/xhtml+xml");
						    	var node = window.document.importNode(oDomDoc.documentElement, true);
								window.document.replaceChild(node,window.document.documentElement);
								// TODO - scripts reloading ?
							}
	          			},30);
	         		}
	         	} catch(e){
	         		LOG.error("Error redirect to new location ");
	         	}
          	} else {
			  if(req.getParserStatus() == Sarissa.PARSED_OK){
				var idsFromResponse = req.getResponseHeader("Ajax-Update-Ids");
        // 3 strategy for replace :
        // if setted affected parameters - replace its
        	  	if( options.affected ) {
	        	  	req.appendNewHeadElements();
					for ( var k =0; k < options.affected.length ; k++ ) {
						LOG.debug("Update page part from call parameter for ID " + options.affected[k]);
						req.updatePagePart(options.affected[k]);
					};
		// if resopnce contains element with ID "ajax:update" get id's from
		// child text element . like :
		// <div id="ajax:update" style="display none" >
		//   <span>_id1:1234</span>
		//    .........
		// </div>
		//
        	  } else if( idsFromResponse != null &&  idsFromResponse != "" ) {
				LOG.debug("Update page by list of rendered areas from response " + idsFromResponse );
        	  // Append scripts and styles to head, if not presented in page before.
        	  	req.appendNewHeadElements();
				var childs = idsFromResponse.split(",");
	        	for ( var k=0 ; k < childs.length ; k++ ) {
	        		var id = childs[k];
	        		LOG.debug("Attempt to update part of page for Id: "+id);
					if ( id ) req.updatePagePart(id);
				};
        	  } else {
        			// if none of above - error ?
					// A4J.AJAX.replace(form.id,A4J.AJAX.findElement(form.id,xmlDoc));
					LOG.warn("No information in response about elements to replace");
        	  }
        	  // Replace client-side hidden inputs for JSF View state.
        	  var idsSpan = req.getElementById("ajax-update-ids");
	          LOG.debug("Hidden JSF state fields: "+idsSpan);
        	  if(idsSpan != null){
        	  		var inputs = window.document.getElementsByTagName("input");
        	  		var newinputs = req.getElementsByTagName("input",idsSpan);
        	  		A4J.AJAX.replaceViewState(inputs,newinputs);
        	  		// For any cases, new state can be in uppercase element
        	  		newinputs = req.getElementsByTagName("INPUT",idsSpan);
        	  		A4J.AJAX.replaceViewState(inputs,newinputs);
        	  }
        	  // Process listeners.
        	  for(var li = 0; li < A4J.AJAX._listeners.length; li++){
        	  	var listener = A4J.AJAX._listeners[li];
        	  	if(listener.onafterajax){
        	  		listener.onafterajax(req,req.domEvt,req.getElementById('_ajax:data'));
        	  	}
        	  }
        	  
           } else {
           // No response XML
   			LOG.error( "Error parsing XML" );
			LOG.error("Parse Error: " + req.getParserStatus());
           }
          }
         }; 
         
A4J.AJAX.onExpired = function(loc,expiredMsg){
	if(window.confirm(expiredMsg)){
		return loc;
	} else {
		return undefined;
	}
}
         

A4J.AJAX.replaceViewState = function(inputs,newinputs){
	      	  		LOG.debug("Replace value for inputs: "+inputs.length + " by new values: "+ newinputs.length);
        	  		if( (newinputs.length > 0) && (inputs.length > 0) ){
        	  			for(var i = 0 ; i < newinputs.length; i++){
        	  				var newinput = newinputs[i];
        	  				LOG.debug("Input in response: "+newinput.getAttribute("name"));
        	  				for(var j = 0 ; j < inputs.length; j++){
        	  					var input = inputs[j];
        	  					if(input.name == newinput.getAttribute("name")){
	        	  				LOG.debug("Found same input on page with type: "+input.type);
        	  						input.value = newinput.getAttribute("value");
        	  					}
        	  				}
        	  			}
        	  		}
	
}
/**
 * 
 */
A4J.AJAX.finishRequest = function(req){
   	    var options = req.options;
       // mark status object ( if any ) for complete request ;
	     A4J.AJAX.status(req.containerId,options.status,false);
	     // we can set listener for complete request - for example,
	     // it can shedule next request for update page.
	     if(options.oncomplete){
   			LOG.debug( "Call request oncomplete function after processing updates" );
   			window.setTimeout(function(){
	     		options.oncomplete(req,req.domEvt,req.getElementById('_ajax:data'));},
	     	50);
	     	
	      }
	      // If we have events in queue - send next request.
          if(options.eventsQueue){
                var eventsQueue =  A4J.AJAX._eventsQueues[options.eventsQueue];
                 if( eventsQueue  )   {
              		A4J.AJAX._eventsQueues[options.eventsQueue]=false;
           	    	if(eventsQueue.wait){
	       				LOG.debug("Queue not empty, execute next request in queue "+options.eventsQueue);
           	     		A4J.AJAX.SubmiteventsQueue(eventsQueue);
           	   			}
          		}
          	}
          }
          
	// Locate enclosing form for object.
A4J.AJAX.locateForm = function(obj){
		
		var parent = obj;
		 while(parent && parent.nodeName.toLowerCase() != 'form'){
			parent = parent.parentNode;
		};
		return parent;
	
	}
    
    // hash for requests count for all ID's
A4J.AJAX._requestsCounts = {};
    // Change status object on start/stop request.
    // on start, document object with targetID+".start" make visible,
    // document object with targetID+".stop" make invisible.
    // on stop - inverse.
A4J.AJAX.status = function(regionID,targetID,start){
	try {
    	var elem;
    	targetID = targetID || regionID +":status";
	    A4J.AJAX._requestsCounts[targetID]=(A4J.AJAX._requestsCounts[targetID]||0)+(start?1:-1);
	    if(A4J.AJAX._requestsCounts[targetID]>0){
	    	elem = document.getElementById(targetID+".start");
	    	if(elem){elem.style.display="";}
	    	elem = document.getElementById(targetID+".stop");
	    	if(elem){elem.style.display="none";}
	    }else{
	    	elem = document.getElementById(targetID+".start");
	    	if(elem){elem.style.display="none";}
	    	elem = document.getElementById(targetID+".stop");
	    	if(elem){elem.style.display="";}
	    }
    } catch(e){
    	LOG.error("Exception on status change: ");
    }
    }
    
	

  
// Class for build query string.
A4J.Query = function(containerId,form){ 
	// For detect AJAX Request.
	 this._query = {AJAXREQUEST : containerId};
	 this._oldSubmit = null ;	
	 this._form = form ;
	 this._actionUrl = ( this._form.action)?this._form.action:this._form;
	};

A4J.Query.prototype = {
	 _form : null,
	 _actionUrl : null,
	 _ext	: "",
	 _query : {},
	 _oldSubmit : null,
 // init at loading time - script can change location at run time ? ...
	 _pageBase : window.location.protocol+"//"+window.location.host,
 // hash for control elements query string functions
 	 
 	 hidden : function(control){
 	 		this._value_query(control);
 	 		// TODO - configurable mask for hidden command scripts.
 	 		if( (control.name.length > 4) && (control.name.lastIndexOf("_idcl") ==  (control.name.length-5)) ){
 	 			control.value="";
 	 			
 	 		// MYfaces version ...	
 	 		} else if( (control.name.length > 12) && (control.name.lastIndexOf("_link_hidden_") ==  (control.name.length-13)) ){
 	 			control.value="";
 	 		} 
 	 },
 	 
 	 text : function(control){
 	 		this._value_query(control);
 	 },

 	 textarea : function(control){
 	 		this._value_query(control);
 	 },

 	 'select-one' : function(control){
 	 	// If none options selected, don't include parameter.
	 	 	for( var i in control.childNodes ){
	 	 		var child=control.childNodes[i];
	 	 		if( child.selected ){
		 	 		this._value_query(control); 		
		 	 		break;
	 	 		}
	 	 	}
 	 },

 	 password : function(control){
 	 		this._value_query(control);
 	 },

 	 file : function(control){
 	 		this._value_query(control);
 	 },

 	 radio : function(control){
 	 		this._check_query(control);
 	 },

 	 checkbox : function(control){
 	 		this._check_query(control);
 	 },

 	 'select-multiple' : function(control){
 	 	var cname = control.name;
 	 	// LOG.debug(" select multiple for control "+ cname );
 	 	for( var i in control.childNodes ){
 	 		var child=control.childNodes[i];
 	 		if( child.selected ){
 	 			if( ! this._query[cname] ){
 	 				this._query[cname]=[];
 	 			}
 	 		// TODO - create multiplay instances !
 	 			this._query[cname][this._query[cname].length]=child.value;
 	 		}
 	 	}
 	 	// LOG.debug(" Filled multiple for control "+ this._query[cname] );
 	 },
// command inputs

 	 image : function( control, action ){ 	 	
 	 		if(action) this._value_query(control);
 	 },
 	 button : function( control, action ){ 	 	
 	 		if(action) this._value_query(control);
 	 },
 	 
 	 submit : function( control, action ){ 	 	
 	 		if(action) { 
 	 			this._value_query(control);
 	 		}
 	 },
 	 
 	 // Anchor link pseudo-control.
 	 link : function(control, action ){
 	 		if(action) {
 	 			this._value_query(control);
 	 			if(control.parameters){
 	 				this.appendParameters(control.parameters);
 	 			}
 	 		}
 	 },
 	 
	// same as link, but have additional field - control, for input submit.
 	 input : function(control, action ){
 	 	if(action) {
 	 		this.link(control, action );
 	 		// append original control.
			if( control.control ) {
        		this.appendControl(control.control,action);
        	}
 	 	}
 	 },
 	 
	 // Append one control to query.
	 appendControl : function(control,action){
			if( this[control.type] ) {
        		this[control.type](control,action);
        	} else {
        		this._appendById(control.id||control);
          }
	 
	 },
	 
	 // Append all non-hidden controls from form to query.
	 appendFormControls : function(hiddenOnly){
	 	try {
	 	 var elems = this._form.elements;
	 	 if(elems){
		 var k = 0;
		   for ( k=0;k<elems.length;k++ ) {
		          var element=elems[k];
				  try {  
				    if(  !hiddenOnly || element.type == "hidden") {
		          		this.appendControl(element,false) ;
		            }
		   		  } catch( ee ) {
			        	 LOG.error("exception in building query ( append form control ) " + ee );
			      }
		    }
		  }
	 	} catch(e) {
	 		LOG.warn("Error with append form controls to query "+e)
	 	}
	 },

	// append map of parameters to query.
	 appendParameters : function(parameters){
		  	for( k in parameters ){
 	 	    LOG.debug( "parameter " + k  + " with value "+parameters[k]);
		  	this.appendParameter(k,parameters[k]);
		  	}
	 },
	 
	 setActionUrl : function(actionUrl){
	 	this._actionUrl = actionUrl;
	 },
// Return action URL ( append extention, if present )
 	 getActionUrl : function( ext ) {
 	 	var actionUrl = this._actionUrl ;
 	 	var ask = actionUrl.indexOf('?');
 	 	// create absolute reference - for Firefox XMLHttpRequest base url can vary
 	 	if( actionUrl.substring(0,1) == '/' ) {
 	 		actionUrl = this._pageBase+actionUrl;
 	 	}
 	 	if ( ! ext ) ext = this._ext ;
 	 	if( ask >=0 )
 	 		{
 	 		return actionUrl.substring(0,ask) + ext + actionUrl.substring(ask); 	 		
 	 		}
 	 	else return actionUrl + ext;
 	 },
 	 
 	 
// Build query string for send to server.
 	 getQueryString : function() {
 	 	var qs = "";
 	 	var iname ;
 	 	for ( var k in this._query ){
 	 		iname = this._query[k];
 	 		if( iname instanceof Object ){
 	 			for ( var l=0; l< iname.length; l++ ) {
	 	 			qs += this._encode(k) + "=" + this._encode(iname[l]) + "&";
	 	 		}
 	 		} else {
 	 			qs += this._encode(k) + "=" + this._encode(iname) + "&";
 	 		}
 	 	}
 	 	LOG.debug("QueryString: "+qs);
 	 	return qs;
 	 },
 	 // private methods
 	 
	 _appendById : function( id ) {
	 	this.appendParameter(this._form.id + "_link_hidden_", id);
	 	// JSF-ri version ...
	 	// this._query[this._form.id + "_idcl"]=id;
	 },
	 

 	 _value_query : function(control){
 	 	this.appendParameter(control.name, control.value);
 	 },
 	 
 	 _check_query : function(control){
 	 	if( control.checked ) {
 	 	this.appendParameter(control.name, control.value?control.value:"on");
 	 	}
 	 },
 	 
 	 // Append parameter to query. if name exist, append to array of parameters
 	 appendParameter: function(cname,value){
 	 			if( ! this._query[cname] ){
 	 				this._query[cname]=value;
 	 				return;
 	 			} else if( !(this._query[cname] instanceof Object) ){
 	 				this._query[cname] = [this._query[cname]];
 	 			}
 	 			this._query[cname][this._query[cname].length]=value;
 	 },
 	 
    // Encode data string for request string
    _encode : function(string) {
	    try {
	    	return encodeURIComponent(string);
	    } catch(e) {
	    var str = escape(string);
	    // escape don't encode +. but form replace  ' ' in fields by '+'
		return str.split('+').join('%2B');
	    }
    }
 	 
 	 
  }
  	


//})();



/**
 * Provide client side logging capabilities to AJAX applications.
 *
 * @author <a href="mailto:thespiegs@users.sourceforge.net">Eric Spiegelberg</a>
 * @see <a href="http://sourceforge.net/projects/log4ajax">Log4Ajax</a>
 */
 
function LOG()
{
  throw "Do not instantiate LOG";
}

LOG.Level = function(name, priority, color){
	this.name = name;
	this.priority = priority;
	if(color){
		this.color = color;
	}
}

LOG.OFF = new LOG.Level("off", 1000);
LOG.FATAL  = new LOG.Level("fatal", 900, "red");
LOG.ERROR = new LOG.Level("error", 800, "red");
LOG.WARN = new LOG.Level("warn", 500, "yellow");
LOG.INFO = new LOG.Level("info", 400, "blue");
LOG.DEBUG = new LOG.Level("debug", 300, "darkblue");
LOG.ALL = new LOG.Level("all", 100);
LOG.A4J_DEBUG = new LOG.Level("a4j_debug", 0, "green");

LOG.LEVEL = LOG.ALL;

LOG.window = null;
LOG.transmitToServer = true;
LOG.consoleDivId = "logConsole";
LOG.styles = {
a4j_debug: "green",
debug : "darkblue",
info : "blue",
warn : "yellow",
error : "red",
fatal : "red"
};

LOG.a4j_debug = function(msg,pre)
{
	LOG._log(msg, LOG.A4J_DEBUG ,pre);
}

LOG.debug = function(msg,pre)
{
	LOG._log(msg, LOG.DEBUG ,pre);
}

LOG.info = function(msg,pre)
{
	LOG._log(msg, LOG.INFO ,pre);
}

LOG.warn = function(msg,pre)
{
	LOG._log(msg, LOG.WARN ,pre);
}

LOG.error = function(msg,pre)
{
	LOG._log(msg, LOG.ERROR ,pre);
}

LOG.fatal = function(msg,pre)
{
	LOG._log(msg, LOG.FATAL ,pre);
}

LOG.registerPopup = function(hotkey,name,width,height){
	if(!LOG._onKeyUp){
		LOG._onKeyUp = document.onkeyup;
	}
	var key = hotkey.toUpperCase();
	document.onkeyup = function(e){
		if (window.event){ e = window.event;};
		if (String.fromCharCode(e.keyCode) == key & e.shiftKey & e.ctrlKey){ 
			LOG.openWindow(name,'width='+width+',height='+height+',toolbar=no,scrollbars=yes,location=no,statusbar=no,menubar=no,resizable=yes,left = '+((screen.width - width) / 2)+',top ='+((screen.height - height) / 2));
		} else {
	      if(LOG._onKeyUp) LOG._onKeyUp(e);
		}; 
	}
}

LOG.openWindow = function(name,features){
	if(LOG.window){
		LOG.window.focus();
	} else {
		LOG.window = window.open("",name,features);
		var _LOG = LOG;
		LOG.window.onunload = function(){
			_LOG.window = null;
			_LOG=undefined;
		}
	}
}

LOG._log = function(msg, logLevel,pre)
{
	if(logLevel.priority >= LOG.LEVEL.priority){
		LOG._logToConsole(msg, logLevel,pre);
	
		if (LOG.transmitToServer)
		{
			LOG._logToServer(msg, logLevel);
		}
	}
}

LOG._time = function(){
	var currentTime = new Date();
	var hours = currentTime.getHours();
	var minutes = currentTime.getMinutes();
	if (minutes < 10){
		minutes = "0" + minutes;
	}
	var seconds = currentTime.getSeconds();
	if (seconds < 10){
		seconds = "0" + seconds;
	}
	var millisec = currentTime.getTime()%1000;
	if(millisec<100){
		millisec = "0"+millisec;
	}
	if(millisec<10){
		millisec = "0"+millisec;
	}
	return hours+":"+minutes+":"+seconds+","+millisec;
}

LOG._logToConsole = function(msg, logLevel,preformat)
{
	var consoleDiv ;
	var doc;
	if(LOG.window && LOG.window.document){
		doc = LOG.window.document;
		consoleDiv = LOG.window.document.body;
	} else {
		doc = window.document;
		consoleDiv = window.document.getElementById(LOG.consoleDivId);
	}
	if (consoleDiv)
	{
		var span = doc.createElement("span");
		span.style.color=logLevel.color;
		span.appendChild(doc.createTextNode(logLevel.name+"["+LOG._time()+"]: "));
	 	var div = doc.createElement("div");
   		var textnode = doc.createTextNode(msg);
        div.appendChild(span);
   		div.appendChild(textnode);
   		// preformatted - for example, html
   		if(preformat){
		 	var pre = doc.createElement("span");
   			textnode = doc.createTextNode(preformat);
   			pre.appendChild(textnode);
	   		div.appendChild(pre);
   		}
        consoleDiv.appendChild(div);
/*	
		consoleDiv.innerHTML = "<span style='" + LOG.styles[logLevel] + "'>" + 
							   logLevel + "</span>: " + msg + "<br/>" + 
							   consoleDiv.innerHTML;*/
	}
	else
	{
		// If the consoleDiv is not available, you could create a 
		// new div or open a new window.
	}
}

LOG._logToServer = function(msg, logLevel)
{
	var data = logLevel.name.substring(0, 1) + msg;
	// TODO - use sarissa-enabled request.
	// Use request.js to make an AJAX transmission to the server
//	Http.get({
//		url: "log",
//		method: "POST",
//		body: data,
//		callback: LOG._requestCallBack
//	});
}

LOG._requestCallBack = function()
{
	// Handle callback functionality here; if appropriate
}
