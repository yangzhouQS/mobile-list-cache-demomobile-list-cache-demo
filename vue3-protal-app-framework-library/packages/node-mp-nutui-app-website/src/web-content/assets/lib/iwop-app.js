var IWOP = (function () {
    'use strict';

    // 内部公共函数
    // ----------
    // 合并对象，浅遍历
    var merger = function (o, c) {
        for (var p in c) {
            if (c.hasOwnProperty(p)) {
                o[p] = c[p];
            }
        }
        return o;
    };
    // 格式化字符串str, 替换掉str中的{0}、{1}等
    var format = function (str) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        return str.replace(/\{(\d+)\}/g, function (m, i) { return values[i]; });
    };
    // 返回值类型
    var getType = function (value) {
        return Object.prototype.toString.call(value).replace("[object ", "").replace("]", "").toLocaleLowerCase();
    };

    // 多语言处理
    // ----------
    var Locale = /** @class */ (function () {
        function Locale() {
            this.localeName = "en";
            this.locales = {};
        }
        // 定义多语言
        Locale.prototype.defineLocale = function (name, config) {
            if (config !== null) {
                this.locales[name] = merger(this.locales[name] || {}, config);
            }
            else {
                delete this.locales[name];
            }
            return;
        };
        // 获取多语言
        Locale.prototype.getLocale = function (name) {
            return this.locales[name || this.localeName];
        };
        // 根据关键code取key
        Locale.prototype.getLocaleKeyByCode = function (code) {
            for (var name_1 in this.locales) {
                var obj = this.locales[name_1];
                for (var key in obj) {
                    if (obj[key].errCode === code) {
                        return key;
                    }
                }
            }
            return "ERR_LOCAL_BY_KEY";
        };
        // 根据关键字获取config
        Locale.prototype.getLocaleByKey = function (key, name) {
            var locale = this.getLocale(name)[key] || this.getLocale(name)["ERR_LOCAL_BY_KEY"];
            return Object.assign({}, locale);
        };
        return Locale;
    }());
    var locale = new Locale();

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    // 原生命令任务基类
    var CommandTask = /** @class */ (function () {
        function CommandTask(triger) {
            this.callbackId = null;
            this.commandTrigger = triger;
        }
        CommandTask.prototype.abort = function () {
            this.commandTrigger.triggerAbort(this.callbackId);
            return this;
        };
        CommandTask.prototype.setCallbackId = function (id) {
            this.callbackId = id;
            return this;
        };
        return CommandTask;
    }());
    // 请求任务类
    // ----------
    var RequestTask = /** @class */ (function (_super) {
        __extends(RequestTask, _super);
        function RequestTask() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return RequestTask;
    }(CommandTask));
    // 原生命令带进度任务基类
    // ----------
    var CommandProgressTask = /** @class */ (function (_super) {
        __extends(CommandProgressTask, _super);
        function CommandProgressTask() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.progressCallbackList = [];
            return _this;
        }
        CommandProgressTask.prototype.onProgressUpdate = function (callback) {
            this.progressCallbackList.push(callback);
            return this;
        };
        CommandProgressTask.prototype.triggerProgress = function (progress, totalBytesSent, totalBytesExpectedToSend) {
            for (var _i = 0, _a = this.progressCallbackList; _i < _a.length; _i++) {
                var item = _a[_i];
                item.call(this, {
                    progress: progress,
                    totalBytesSent: totalBytesSent,
                    totalBytesExpectedToSend: totalBytesExpectedToSend,
                });
            }
        };
        return CommandProgressTask;
    }(CommandTask));
    // 上传任务类
    // ----------
    var UploadTask = /** @class */ (function (_super) {
        __extends(UploadTask, _super);
        function UploadTask() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return UploadTask;
    }(CommandProgressTask));
    // 下载任务类
    // ----------
    var DownloadTask = /** @class */ (function (_super) {
        __extends(DownloadTask, _super);
        function DownloadTask() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return DownloadTask;
    }(CommandProgressTask));

    var rules = {
        "request": {
            "url": { type: "url", isAllowRelative: true, isRequired: true },
            "method": { type: "enum", enum: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"] },
            "header": { type: "object", itemRule: { type: "string", isRequired: true } },
            "data": { type: "any" },
        },
        "uploadFile": {
            "filePath": { type: "iwopUrl", host: ["temp", "files"], isRequired: true },
            "product": { type: "string", isRequired: true },
            "forPublic": { type: "boolean" },
            "tempFile": { type: "boolean" },
            "key": { type: "string" },
            "contentType": { type: "string" },
            "autoGenerated": { type: "boolean" },
        },
        "downloadFile": {
            "url": [{ type: "url", isAllowRelative: true, isRequired: true }, { type: "ossUrl", isRequired: true }],
        },
        "addUploadTask": {
            "url": { type: "url", isAllowRelative: true, isRequired: true },
            "data": { type: "any", isRequired: true },
            "attachments": { type: "array", itemRule: { type: "object", rule: "uploadFile" } },
        },
        "getUploadTaskList": {
            "taskIds": { type: "array", itemRule: { type: "number", isRequired: true } },
        },
        "removeUploadTask": {
            "taskId": { type: "number", isRequired: true },
        },
        "stopUploadTask": {
            "taskId": { type: "number", isRequired: true },
        },
        "clearUploadTask": {},
        "saveFile": {
            "tempFilePath": { type: "iwopUrl", host: ["temp"], isRequired: true },
        },
        "getSavedFileList": {},
        "removeSavedFile": {
            "filePath": { type: "iwopUrl", host: ["files"], isRequired: true },
        },
        "unBundleFile": {
            "filePath": { type: "iwopUrl", host: ["temp", "files"], isRequired: true },
            "bundleName": { type: "string" },
        },
        "getBundleList": {},
        "removeBundle": {
            "bundlePath": { type: "iwopUrl", host: ["bundles"], isRequired: true },
        },
        "getFileInfo": {
            "filePath": { type: "iwopUrl", host: ["temp", "files", "bundles", "apps"], isRequired: true },
            "digestAlgorithm": { type: "enum", enum: ["md5", "sha1"], default: "md5" },
            "returnContent": { type: "boolean" },
        },
        "getFileInfoInBundle": {
            "bundlePath": { type: "iwopUrl", host: ["temp", "files", "bundles", "apps"], isRequired: true },
            "filePath": { type: "string", isRequired: true },
            "digestAlgorithm": { type: "enum", enum: ["md5", "sha1"], default: "md5" },
            "returnContent": { type: "boolean" },
        },
        "openDocument": {
            "filePath": { type: "iwopUrl", host: ["temp", "files", "bundles", "apps"], isRequired: true },
            "fileName": { type: "string" }
        },
        "setStorage": {
            "key": { type: "string", isRequired: true },
            "data": { type: "any", isRequired: true },
        },
        "getStorage": {
            "key": { type: "string", isRequired: true },
        },
        "getStorageInfo": {},
        "removeStorage": {
            "key": { type: "string", isRequired: true },
        },
        "clearStorage": {},
        "playVoice": {
            "localId": { type: "iwopUrl", host: ["resourceid"], isRequired: true }
        },
        "pauseVoice": {
            "localId": { type: "iwopUrl", host: ["resourceid"], isRequired: true }
        },
        "stopVoice": {
            "localId": { type: "iwopUrl", host: ["resourceid"], isRequired: true }
        },
        "startRecord": {},
        "stopRecord": {},
        "uploadVoice": {
            "localId": { type: "iwopUrl", host: ["resourceid"], isRequired: true },
            "product": { type: "string", isRequired: true }
        },
        "chooseImage": {
            "count": { type: "number", default: 9 },
            "sizeType": { type: "array", itemRule: { type: "enum", enum: ["original", "compressed"], isRequired: true }, default: ["original", "compressed"] },
            "sourceType": { type: "array", itemRule: { type: "enum", enum: ["album", "camera"], isRequired: true }, default: ["album", "camera"] },
            "mediaType": { type: "enum", enum: ["image", "video", "mix"], default: "mix" },
        },
        "chooseAttachments": {
            "count": { type: "number", default: 9 },
            "sizeType": { type: "array", itemRule: { type: "enum", enum: ["original", "compressed"], isRequired: true }, default: ["original", "compressed"] },
            "sourceType": { type: "array", itemRule: { type: "enum", enum: ["album", "camera", "audio"], isRequired: true }, default: ["album", "camera", "audio"] },
            "audioType": { type: "enum", enum: ["instand", "full"], default: "instand" },
            "mediaType": { type: "enum", enum: ["image", "video", "mix"], default: "mix" },
            "watermarks": { type: "array", itemRule: { type: "object", rule: "watermark" } },
            "templateInfo": { type: "nullAbleObject", isRequired: false, rule: {
                    "orgId": { type: "string", isRequired: true },
                    "product": { type: "string", isRequired: true },
                    "albumPageUrl": { type: "string", isRequired: false },
                    "templateAlbumPageUrl": { type: "string", isRequired: true },
                    "albumUrl": { type: "string", isRequired: false },
                    "updateAlbumUrl": { type: "string", isRequired: false },
                    "templateAlbumUrl": { type: "string", isRequired: true },
                } },
        },
        "watermark": {
            "id": { type: "number", isRequired: true },
            "svg": { type: "string" },
            "default": { type: "boolean" }
        },
        "signUp": {
            "portrait": { type: "boolean" }
        },
        "showShareModal": {
            "text": { type: "string", isRequired: true },
            "title": { type: "string", isRequired: false },
            "imageUrl": { type: "string" },
            "url": { type: "string" },
        },
        "recordAudio": {
            "recordType": { type: "enum", enum: ["instand", "full"], default: "instand" },
        },
        "previewImage": {
            "current": [{ type: "url" }, { type: "iwopUrl", host: ["temp", "files", "bundles", "apps"] }],
            "urls": { type: "array", itemRule: [{ type: "url", isRequired: true }, { type: "iwopUrl", host: ["temp", "files", "bundles", "apps"], isRequired: true }] },
            "thumbnails": { type: "array", itemRule: [{ type: "url" }, { type: "iwopUrl", host: ["temp", "files", "bundles", "apps"] }] },
        },
        "getImageInfo": {
            "src": [{ type: "url", isRequired: true }, { type: "iwopUrl", host: ["temp", "files", "bundles", "apps"], isRequired: true }],
            "thumbnail": { type: "object", rule: {
                    "width": { type: "number" },
                    "height": { type: "number" },
                } },
        },
        "saveImageToPhotosAlbum": {
            "filePath": { type: "iwopUrl", host: ["temp", "files", "bundles", "apps"], isRequired: true },
        },
        "scanCode": {},
        "showHikVision": {
            "address": { type: "string", isRequired: true },
            "port": { type: "number", default: 443 },
            "username": { type: "string", isRequired: true },
            "password": { type: "string", isRequired: true },
        },
        "showHikVisionV2": {
            "orgId": { type: "number", isRequired: true },
        },
        "showHikVisionV3": {
            "apiHost": { type: "string", isRequired: true },
            "appKey": { type: "string", isRequired: true },
            "appSecret": { type: "string", isRequired: true },
            "vmName": { type: "string", isRequired: false },
            "channels": { type: "array", isRequired: false },
        },
        "checkSession": {},
        "getUserInfo": {},
        "setNavigationBarTitle": {
            "title": { type: "string", isRequired: true, isAllowEmptyString: true },
        },
        "setCameraTemplate": {
            "imgUrl": { type: "string", isRequired: true },
            "outlineImgUrl": { type: "string", isRequired: true },
        },
        "setNavigationBarConfig": {
            "title": { type: "string", isRequired: false, isAllowEmptyString: true },
            "style": { type: "enum", enum: ["default", "translate"] },
            "backgroundColor": { type: "colorHex" },
            "foregroundColor": { type: "enum", enum: ["white", "black"] },
            "buttonStyle": { type: "enum", enum: ["default", "noBack", "empty"] }
        },
        "getNavigationBarConfig": {},
        "getSystemInfo": {},
        "navigateToHome": {},
        "getLocation": {
            "type": { type: "enum", enum: ["wgs84", "gcj02"] }
        },
        "closeBLEConnection": {
            "deviceId": { type: "string", isRequired: true }
        },
        "createBLEConnection": {
            "deviceId": { type: "string", isRequired: true },
            "timeout": { type: "number" }
        },
        "getBLEDeviceCharacteristics": {
            "deviceId": { type: "string", isRequired: true },
            "serviceId": { type: "string", isRequired: true }
        },
        "getBLEDeviceServices": {
            "deviceId": { type: "string", isRequired: true }
        },
        "writeBLECharacteristicValue": {
            "deviceId": { type: "string", isRequired: true },
            "serviceId": { type: "string", isRequired: true },
            "characteristicId": { type: "string", isRequired: true },
            "value": { type: "arrayBuffer", isRequired: true }
        },
        "closeBluetoothAdapter": {},
        "getBluetoothAdapterState": {},
        "getBluetoothDevices": {},
        "getConnectedBluetoothDevices": {
            "services": { type: "array", itemRule: { type: "string", isRequired: true } }
        },
        "openBluetoothAdapter": {},
        "startBluetoothDevicesDiscovery": {
            "services": { type: "array", itemRule: { type: "string", isRequired: true } }
        },
        "stopBluetoothDevicesDiscovery": {},
        "readBLECharacteristicValue": {
            "deviceId": { type: "string", isRequired: true },
            "serviceId": { type: "string", isRequired: true },
            "characteristicId": { type: "string", isRequired: true }
        },
        "notifyBLECharacteristicValueChange": {
            "deviceId": { type: "string", isRequired: true },
            "serviceId": { type: "string", isRequired: true },
            "characteristicId": { type: "string", isRequired: true },
            "state": { type: "boolean", isRequired: true },
        },
        "getNetworkType": {},
        "closePage": {},
        "hashChange": {},
        "openApp": {
            "appId": { type: "string", isRequired: true },
        },
        "replacePage": {
            "url": { type: "url", isAllowRelative: false, isRequired: true },
        },
        "rotateView": {
            "showStatusBar": { type: "boolean" },
        },
        "resetView": {},
        "showLoading": {
            "text": { type: "string" },
            "mask": { type: "boolean" },
        },
        "hideLoading": {},
        "showAlert": {
            "message": { type: "string", isRequired: true },
            "title": { type: "string" },
            "buttonName": { type: "string", isRequired: true },
        },
        "showActionSheet": {
            "cancelButton": { type: "string", isRequired: true },
            "title": { type: "string", isRequired: true },
            "itemList": { type: "array", isRequired: true, itemRule: { type: "string", isRequired: true } },
        },
        "showModal": {
            "title": { type: "string" },
            "content": { type: "string" },
            "cancelText": { type: "string", maxLength: 4 },
            "confirmText": { type: "string", maxLength: 4 },
        },
        "showToast": {
            "text": { type: "string", isRequired: true },
            "duration": { type: "number" },
        },
        "getClipboardData": {},
        "setClipboardData": {
            "text": { type: "string", isRequired: true },
        },
        "openRoutePlanning": {
            "latitude": { type: "numberDouble", isRequired: true },
            "longitude": { type: "numberDouble", isRequired: true },
            "name": { type: "string" },
        }
    };
    var getDefaultValue = function (value, ruleInfo) {
        var result = value;
        if (getType(ruleInfo) === "array") {
            result = getDefaultValue(result, ruleInfo[0]);
        }
        else {
            var info = ruleInfo;
            if (!info.isRequired) {
                switch (info.type) {
                    case "string":
                    case "url":
                    case "colorHex":
                    case "iwopUrl":
                    case "ossUrl":
                        result = (result === undefined || result === null) ? (info.default || "") : result;
                        break;
                    case "number":
                    case "numberDouble":
                        result = (result === undefined || result === null) ? (info.default || 0) : result;
                        break;
                    case "boolean":
                        result = (result === undefined || result === null) ? (info.default || false) : result;
                        break;
                    case "object":
                        result = (result === undefined || result === null) ? (info.default || {}) : result;
                        break;
                    case "nullAbleObject":
                        result = (result === undefined || result === null) ? (info.default || {}) : result;
                        break;
                    case "array":
                        result = (result === undefined || result === null) ? (info.default || []) : result;
                        break;
                    case "arrayBuffer":
                        result = (result === undefined || result === null) ? (info.default || new Uint8Array()) : result;
                        break;
                    case "enum":
                        result = (result === undefined || result === null) ? (info.default || info.enum[0]) : result;
                    default: // "any"
                        result = result === undefined ? (info.default || null) : result;
                        break;
                }
            }
        }
        return result;
    };
    var checkRuleInfoString = function (ruleInfo, param) {
        var result = getType(param) === "string";
        if (result && (ruleInfo.isRequired && !ruleInfo.isAllowEmptyString)) {
            result = param.length > 0;
        }
        if (result && ruleInfo.maxLength) {
            result = param.length <= ruleInfo.maxLength;
        }
        return result;
    };
    var checkRuleInfoUrl = function (ruleInfo, param) {
        var result = getType(param) === "string";
        if (result && ruleInfo.isRequired) {
            result = param.length > 0;
        }
        if (result) {
            if (param.length > 0 && !ruleInfo.isAllowRelative) {
                result = param.trim().toLowerCase().startsWith("http://") || param.trim().toLowerCase().startsWith("https://");
            }
        }
        return result;
    };
    var checkRuleInfoIWOPUrl = function (ruleInfo, param) {
        var result = getType(param) === "string";
        if (result && ruleInfo.isRequired) {
            result = param.length > 0;
        }
        if (result) {
            if (param.length > 0 && ruleInfo.host.length > 0) {
                result = false;
                for (var _i = 0, _a = ruleInfo.host; _i < _a.length; _i++) {
                    var host = _a[_i];
                    result = param.trim().toLowerCase().startsWith("iwop://" + host + "/");
                    if (result) {
                        break;
                    }
                }
            }
        }
        return result;
    };
    var checkRuleInfoHex = function (ruleInfo, param) {
        var result = getType(param) === "string";
        if (result && ruleInfo.isRequired) {
            result = param.length > 0;
        }
        if (result) {
            if (param.length > 0) {
                var hex = param.trim().toLowerCase();
                result = hex.startsWith("#") && hex.match(/^#([0-9a-fA-F]{6})$/) != null;
            }
        }
        return result;
    };
    var checkRuleInfoOSSUrl = function (ruleInfo, param) {
        var result = getType(param) === "string";
        if (result && ruleInfo.isRequired) {
            result = param.length > 0;
        }
        if (result) {
            if (param.length > 0) {
                result = param.trim().toLowerCase().startsWith("oss://");
            }
        }
        return result;
    };
    var checkRuleInfoNumber = function (ruleInfo, param) {
        var result = getType(param) === "number";
        if (result) {
            result = param >= 0 && param % 1 === 0; // 只允许正整数
        }
        return result;
    };
    var checkRuleInfoNumberDouble = function (ruleInfo, param) {
        var result = getType(param) === "number";
        if (result) {
            result = param >= 0;
        }
        return result;
    };
    var checkRuleInfoBoolean = function (ruleInfo, param) {
        var result = getType(param) === "boolean";
        return result;
    };
    var checkRuleInfoObject = function (ruleInfo, param) {
        var result = getType(param) === "object";
        if (result && ruleInfo.itemRule) {
            for (var key in param) {
                if (param.hasOwnProperty(key)) {
                    var item = param[key];
                    result = checkRuleInfo(ruleInfo.itemRule, item);
                    if (!result) {
                        break;
                    }
                }
            }
        }
        if (result && ruleInfo.rule) {
            result = checkRule(ruleInfo.rule, param);
        }
        return result;
    };
    var checkRuleInfoNullAbleObject = function (ruleInfo, param) {
        var result = getType(param) === "object";
        if (result && ruleInfo.rule) {
            var isTrue = false;
            for (var key in param) {
                isTrue = true;
            }
            if (isTrue) {
                result = checkRule(ruleInfo.rule, param);
            }
        }
        return result;
    };
    var checkRuleInfoArray = function (ruleInfo, param) {
        var result = getType(param) === "array";
        if (result && ruleInfo.itemRule) {
            for (var _i = 0, param_1 = param; _i < param_1.length; _i++) {
                var item = param_1[_i];
                result = checkRuleInfo(ruleInfo.itemRule, item);
                if (!result) {
                    break;
                }
            }
        }
        if (result && ruleInfo.maxLength) {
            result = param.length <= ruleInfo.maxLength;
        }
        return result;
    };
    var checkRuleInfoEnum = function (ruleInfo, param) {
        var result = getType(param) === "string";
        if (result) {
            result = ruleInfo.enum.indexOf(param) >= 0;
        }
        return result;
    };
    var checkRuleInfoArrayBuffer = function (ruleInfo, param) {
        return param instanceof ArrayBuffer || (param && param.buffer && param.buffer instanceof ArrayBuffer);
    };
    var checkRuleInfoAny = function (ruleInfo, param) {
        var result = getType(param) !== "undefined";
        return result;
    };
    var checkRuleInfo = function (ruleInfo, param) {
        var result;
        if (getType(ruleInfo) === "array") {
            var infoList = ruleInfo;
            var success = false;
            for (var _i = 0, infoList_1 = infoList; _i < infoList_1.length; _i++) {
                var info = infoList_1[_i];
                success = success || checkRuleInfo(info, param);
            }
            result = success;
        }
        else {
            var info = ruleInfo;
            switch (info.type) {
                case "string":
                    result = checkRuleInfoString(info, param);
                    break;
                case "url":
                    result = checkRuleInfoUrl(info, param);
                    break;
                case "iwopUrl":
                    result = checkRuleInfoIWOPUrl(info, param);
                    break;
                case "ossUrl":
                    result = checkRuleInfoOSSUrl(info, param);
                    break;
                case "colorHex":
                    result = checkRuleInfoHex(info, param);
                    break;
                case "number":
                    result = checkRuleInfoNumber(info, param);
                    break;
                case "numberDouble":
                    result = checkRuleInfoNumberDouble(info, param);
                    break;
                case "boolean":
                    result = checkRuleInfoBoolean(info, param);
                    break;
                case "object":
                    result = checkRuleInfoObject(info, param);
                    break;
                case "nullAbleObject":
                    result = checkRuleInfoNullAbleObject(info, param);
                    break;
                case "array":
                    result = checkRuleInfoArray(info, param);
                    break;
                case "arrayBuffer":
                    result = checkRuleInfoArrayBuffer(info, param);
                    break;
                case "enum":
                    result = checkRuleInfoEnum(info, param);
                default: // "any"
                    result = checkRuleInfoAny(info, param);
                    break;
            }
        }
        return result;
    };
    var checkRule = function (cmd, params, failCallback) {
        // console.log('checkRule:' + JSON.stringify(params));
        var result = true;
        var rule = (typeof cmd === "string") ? rules[cmd] : cmd;
        // 设置属性默认值
        for (var key in rule) {
            params[key] = getDefaultValue(params[key], rule[key]);
        }
        var invalidKeys = [];
        // 检查参数正确性
        for (var key in params) {
            var param = params[key];
            var ruleInfo = rule[key];
            if (ruleInfo) {
                if (!checkRuleInfo(ruleInfo, param)) {
                    invalidKeys.push(key);
                }
            }
            else {
                // 删除多余参数，有多余参数不报错
                delete rule[key];
            }
        }
        var keysStr = invalidKeys.join(",");
        if (invalidKeys.length > 0) {
            result = false;
            failCallback && failCallback("ERR_COMMAND_EXEC_PARAM", [keysStr]);
        }
        return result;
    };

    // 原生命令类
    // ----------
    var Command = /** @class */ (function () {
        function Command(cmd) {
            this.callbackIdSequence = 0;
            this.callbackMap = {};
            this.eventMap = {};
            this.from = "src";
            this.version = Command.sVersion;
            if (cmd) {
                this.callbackIdSequence = cmd.callbackIdSequence;
                this.callbackMap = cmd.callbackMap;
                this.eventMap = cmd.eventMap;
            }
        }
        Command.prototype.isOld = function (version) {
            var originVArr = this.version.split(".");
            var newVArr = version.split(".");
            var result = false;
            for (var i = 0; i < Math.min(originVArr.length, newVArr.length); i++) {
                result = Number.parseInt(originVArr[i]) < Number.parseInt(newVArr[i]);
                if (result) {
                    return result;
                }
            }
            return originVArr.length < newVArr.length;
        };
        Command.prototype.getPlatformBuild = function () {
            var info;
            if (window.command && window.command.getPlatformInfo) {
                var build = JSON.parse(window.command.getPlatformInfo());
                info = { apiBuild: build };
            }
            if (window.webkit && window.webkit.messageHandlers && window.iwopPlatformInfo) {
                info = window.iwopPlatformInfo;
            }
            return (info && info.apiBuild) ? info.apiBuild : -1;
        };
        Command.prototype.request = function (options) {
            var task = new RequestTask(this);
            options.data = JSON.stringify(options.data);
            this.execTask("request", options, task);
            return task;
        };
        Command.prototype.uploadFile = function (options) {
            var task = new UploadTask(this);
            this.execTask("uploadFile", options, task);
            return task;
        };
        Command.prototype.downloadFile = function (options) {
            var task = new DownloadTask(this);
            this.execTask("downloadFile", options, task);
            return task;
        };
        Command.prototype.addUploadTask = function (options) {
            options.data = JSON.stringify(options.data);
            return this.exec("addUploadTask", options);
        };
        Command.prototype.getUploadTaskList = function (options) {
            var _this = this;
            options.taskIds = options.taskIds || [];
            options.success = (function (callback) {
                return function (data) {
                    if (data && data.tasks && data.tasks.forEach) {
                        data.tasks.forEach(function (element) {
                            element.data = JSON.parse(element.data);
                        });
                    }
                    if (callback) {
                        callback.call(_this, data);
                    }
                };
            })(options.success);
            return this.exec("getUploadTaskList", options);
        };
        Command.prototype.removeUploadTask = function (options) {
            var _this = this;
            options.success = (function (callback) {
                return function (data) {
                    if (data && data.task) {
                        data.task.data = JSON.parse(data.task.data);
                    }
                    if (callback) {
                        callback.call(_this, data);
                    }
                };
            })(options.success);
            return this.exec("removeUploadTask", options);
        };
        Command.prototype.stopUploadTask = function (options) {
            var _this = this;
            options.success = (function (callback) {
                return function (data) {
                    if (data && data.task) {
                        data.task.data = JSON.parse(data.task.data);
                    }
                    if (callback) {
                        callback.call(_this, data);
                    }
                };
            })(options.success);
            return this.exec("stopUploadTask", options);
        };
        Command.prototype.clearUploadTask = function (options) {
            return this.exec("clearUploadTask", options);
        };
        Command.prototype.saveFile = function (options) {
            return this.exec("saveFile", options);
        };
        Command.prototype.getSavedFileList = function (options) {
            return this.exec("getSavedFileList", options);
        };
        Command.prototype.removeSavedFile = function (options) {
            return this.exec("removeSavedFile", options);
        };
        Command.prototype.unBundleFile = function (options) {
            return this.exec("unBundleFile", options);
        };
        Command.prototype.getBundleList = function (options) {
            return this.exec("getBundleList", options);
        };
        Command.prototype.removeBundle = function (options) {
            return this.exec("removeBundle", options);
        };
        Command.prototype.getFileInfo = function (options) {
            return this.exec("getFileInfo", options);
        };
        Command.prototype.getFileInfoInBundle = function (options) {
            return this.exec("getFileInfoInBundle", options);
        };
        Command.prototype.openDocument = function (options) {
            return this.exec("openDocument", options);
        };
        Command.prototype.setStorage = function (options) {
            options.data = JSON.stringify(options.data);
            return this.exec("setStorage", options);
        };
        Command.prototype.getStorage = function (options) {
            var _this = this;
            options.success = (function (callback) {
                return function (data) {
                    if (data && data.data) {
                        data.data = JSON.parse(data.data);
                    }
                    if (callback) {
                        callback.call(_this, data);
                    }
                };
            })(options.success);
            return this.exec("getStorage", options);
        };
        Command.prototype.getStorageInfo = function (options) {
            return this.exec("getStorageInfo", options);
        };
        Command.prototype.removeStorage = function (options) {
            return this.exec("removeStorage", options);
        };
        Command.prototype.clearStorage = function (options) {
            return this.exec("clearStorage", options);
        };
        // -----------share------
        Command.prototype.showShareModal = function (options) {
            return this.exec("showShareModal", options);
        };
        // -----------media------audio
        Command.prototype.playVoice = function (options) {
            return this.exec("playVoice", options);
        };
        Command.prototype.pauseVoice = function (options) {
            return this.exec("pauseVoice", options);
        };
        Command.prototype.stopVoice = function (options) {
            return this.exec("stopVoice", options);
        };
        Command.prototype.startRecord = function (options) {
            return this.exec("startRecord", options);
        };
        Command.prototype.stopRecord = function (options) {
            return this.exec("stopRecord", options);
        };
        Command.prototype.uploadVoice = function (options) {
            var task = new UploadTask(this);
            this.execTask("uploadVoice", options, task);
            return task;
        };
        Command.prototype.onVoicePlayEnd = function (callback) {
            if (typeof callback === "function") {
                this.eventMap["onVoicePlayEnd"] = callback;
            }
        };
        Command.prototype.onVoiceRecordEnd = function (callback) {
            if (typeof callback === "function") {
                this.eventMap["onVoiceRecordEnd"] = callback;
            }
        };
        Command.prototype.chooseImage = function (options) {
            return this.exec("chooseImage", options);
        };
        Command.prototype.chooseAttachments = function (options) {
            return this.exec("chooseAttachments", options);
        };
        Command.prototype.signUp = function (options) {
            return this.exec("signUp", options);
        };
        Command.prototype.previewImage = function (options) {
            return this.exec("previewImage", options);
        };
        Command.prototype.getImageInfo = function (options) {
            return this.exec("getImageInfo", options);
        };
        Command.prototype.saveImageToPhotosAlbum = function (options) {
            return this.exec("saveImageToPhotosAlbum", options);
        };
        Command.prototype.scanCode = function (options) {
            return this.exec("scanCode", options);
        };
        Command.prototype.showHikVision = function (options) {
            return this.exec("showHikVision", options);
        };
        Command.prototype.showHikVisionV2 = function (options) {
            return this.exec("showHikVisionV2", options);
        };
        Command.prototype.showHikVisionV3 = function (options) {
            return this.exec("showHikVisionV3", options);
        };
        Command.prototype.checkSession = function (options) {
            return this.exec("checkSession", options);
        };
        Command.prototype.getUserInfo = function (options) {
            return this.exec("getUserInfo", options);
        };
        Command.prototype.setNavigationBarTitle = function (options) {
            return this.exec("setNavigationBarTitle", options);
        };
        Command.prototype.setCameraTemplate = function (options) {
            return this.exec("setCameraTemplate", options);
        };
        Command.prototype.setNavigationBarConfig = function (options) {
            var allowKeys = ["title", "style", "backgroundColor", "foregroundColor", "buttonStyle"];
            var usableKeys = [];
            // 此方法允许只传入部分属性,为了过滤自动生成的默认值,加入了usableKeys字段,记录外部传入的key
            for (var key in options) {
                if (options.hasOwnProperty(key)) {
                    if (allowKeys.indexOf(key) >= 0) {
                        usableKeys.push(key);
                    }
                }
            }
            options.usableKeys = usableKeys;
            return this.exec("setNavigationBarConfig", options);
        };
        Command.prototype.getNavigationBarConfig = function (options) {
            return this.exec("getNavigationBarConfig", options);
        };
        Command.prototype.getSystemInfo = function (options) {
            return this.exec("getSystemInfo", options);
        };
        Command.prototype.navigateToHome = function (options) {
            return this.exec("navigateToHome", options);
        };
        Command.prototype.getLocation = function (options) {
            return this.exec("getLocation", options);
        };
        // -----------ble------bluetooth
        Command.prototype.closeBLEConnection = function (options) {
            return this.exec("closeBLEConnection", options);
        };
        Command.prototype.createBLEConnection = function (options) {
            return this.exec("createBLEConnection", options);
        };
        Command.prototype.getBLEDeviceCharacteristics = function (options) {
            return this.exec("getBLEDeviceCharacteristics", options);
        };
        Command.prototype.getBLEDeviceServices = function (options) {
            return this.exec("getBLEDeviceServices", options);
        };
        Command.prototype.onBLEConnectionStateChange = function (callback) {
            if (typeof callback === "function") {
                this.eventMap["onBLEConnectionStateChange"] = callback;
            }
        };
        Command.prototype.writeBLECharacteristicValue = function (options) {
            return this.exec("writeBLECharacteristicValue", options);
        };
        Command.prototype.closeBluetoothAdapter = function (options) {
            return this.exec("closeBluetoothAdapter", options);
        };
        Command.prototype.getBluetoothAdapterState = function (options) {
            return this.exec("getBluetoothAdapterState", options);
        };
        Command.prototype.getBluetoothDevices = function (options) {
            return this.exec("getBluetoothDevices", options);
        };
        Command.prototype.getConnectedBluetoothDevices = function (options) {
            return this.exec("getConnectedBluetoothDevices", options);
        };
        Command.prototype.onBluetoothAdapterStateChange = function (callback) {
            if (typeof callback === "function") {
                this.eventMap["onBluetoothAdapterStateChange"] = callback;
            }
        };
        Command.prototype.onBluetoothDeviceFound = function (callback) {
            if (typeof callback === "function") {
                this.eventMap["onBluetoothDeviceFound"] = callback;
            }
        };
        Command.prototype.offBLEConnectionStateChange = function () {
            delete this.eventMap["onBLEConnectionStateChange"];
        };
        Command.prototype.offBluetoothDeviceFound = function () {
            delete this.eventMap["onBluetoothDeviceFound"];
        };
        Command.prototype.offBluetoothAdapterStateChange = function () {
            delete this.eventMap["onBluetoothAdapterStateChange"];
        };
        Command.prototype.onBLECharacteristicValueChange = function (callback) {
            if (typeof callback === "function") {
                this.eventMap["onBLECharacteristicValueChange"] = callback;
            }
        };
        Command.prototype.offBLECharacteristicValueChange = function (callback) {
            delete this.eventMap["onBLECharacteristicValueChange"];
        };
        Command.prototype.openBluetoothAdapter = function (options) {
            return this.exec("openBluetoothAdapter", options);
        };
        Command.prototype.startBluetoothDevicesDiscovery = function (options) {
            return this.exec("startBluetoothDevicesDiscovery", options);
        };
        Command.prototype.stopBluetoothDevicesDiscovery = function (options) {
            return this.exec("stopBluetoothDevicesDiscovery", options);
        };
        Command.prototype.notifyBLECharacteristicValueChange = function (options) {
            return this.exec("notifyBLECharacteristicValueChange", options);
        };
        // --------------base----------
        // -----------callback---------
        Command.prototype.onNetworkStatusChange = function (callback) {
            if (typeof callback === "function") {
                this.eventMap["onNetworkStatusChange"] = callback;
            }
        };
        Command.prototype.onPagePause = function (callback) {
            if (typeof callback === "function") {
                this.eventMap["onPagePause"] = callback;
            }
        };
        Command.prototype.onPageResume = function (callback) {
            if (typeof callback === "function") {
                this.eventMap["onPageResume"] = callback;
            }
        };
        Command.prototype.onTitleDoubleClick = function (callback) {
            if (typeof callback === "function") {
                this.eventMap["onTitleDoubleClick"] = callback;
            }
        };
        // ------------device---------
        Command.prototype.getNetworkType = function (options) {
            return this.exec("getNetworkType", options);
        };
        // -----------nav------
        Command.prototype.closePage = function (options) {
            return this.exec("closePage", options);
        };
        Command.prototype.hashChange = function (options) {
            return this.exec("hashChange", options);
        };
        Command.prototype.replacePage = function (options) {
            return this.exec("replacePage", options);
        };
        Command.prototype.openApp = function (options) {
            return this.exec("openApp", options);
        };
        Command.prototype.rotateView = function (options) {
            return this.exec("rotateView", options);
        };
        Command.prototype.resetView = function (options) {
            return this.exec("resetView", options);
        };
        Command.prototype.onHistoryBack = function (callback) {
            if (typeof callback === "function") {
                this.eventMap["onHistoryBack"] = callback;
            }
        };
        // -----------popup------------
        Command.prototype.showLoading = function (options) {
            return this.exec("showLoading", options);
        };
        Command.prototype.hideLoading = function (options) {
            return this.exec("hideLoading", options);
        };
        Command.prototype.showAlert = function (options) {
            return this.exec("showAlert", options);
        };
        Command.prototype.showActionSheet = function (options) {
            return this.exec("showActionSheet", options);
        };
        Command.prototype.showModal = function (options) {
            return this.exec("showModal", options);
        };
        Command.prototype.showToast = function (options) {
            return this.exec("showToast", options);
        };
        // ----------other-------------------------------
        Command.prototype.getClipboardData = function (options) {
            return this.exec("getClipboardData", options);
        };
        Command.prototype.setClipboardData = function (options) {
            return this.exec("setClipboardData", options);
        };
        Command.prototype.openRoutePlanning = function (options) {
            return this.exec("openRoutePlanning", options);
        };
        // ---------------------------------------------
        Command.prototype.triggerAbort = function (callbackId) {
            if (this.callbackMap[callbackId]) {
                this.internalExecWithCallbackId(callbackId, "taskAbort", {});
            }
        };
        Command.prototype.triggerEvent = function (name, res) {
            if (res === void 0) { res = true; }
            var callback = this.eventMap[name];
            if (callback && typeof callback === "function") {
                res = this.transParams(name, res);
                callback.call(this, res);
            }
        };
        Command.prototype.triggerProgress = function (callbackId, progress, totalBytesSent, totalBytesExpectedToSend) {
            var item = this.callbackMap[callbackId];
            if (item && item.task && item.task instanceof CommandProgressTask) {
                item.task.triggerProgress(progress, totalBytesSent, totalBytesExpectedToSend);
            }
        };
        Command.prototype.triggerSuccess = function (callbackId, data) {
            if (data === void 0) { data = true; }
            var item = this.callbackMap[callbackId];
            if (item) {
                delete this.callbackMap[callbackId];
                this.transCallbackData(item.cmd, data);
                item.success && item.success.call(this, data);
            }
            else {
                var msg = this.getLocaleMessageConfig("ERR_COMMAND_EXEC_CALLBACK", [callbackId]);
                window.console.error(msg);
            }
        };
        Command.prototype.triggerFail = function (callbackId, key, values, res) {
            var item = this.callbackMap[callbackId];
            if (item) {
                delete this.callbackMap[callbackId];
                if ((typeof key) === "number") {
                    key = Command.locale.getLocaleKeyByCode(key);
                }
                var locale_1 = this.getLocaleMessageConfig(key, values);
                item.fail && item.fail.call(this, locale_1.errMsg, locale_1, res);
            }
            else {
                var msg = this.getLocaleMessageConfig("ERR_COMMAND_EXEC_CALLBACK", [callbackId]);
                window.console.error(msg);
            }
        };
        Command.prototype.getLocaleMessageConfig = function (key, values) {
            var msgConfig = null;
            key = key || "ERR_COMMAND_INVOKE";
            msgConfig = Command.locale.getLocaleByKey(key);
            values = values || ["-1"];
            values.unshift(msgConfig.errMsg);
            msgConfig.errMsg = format.apply(this, values);
            return msgConfig;
        };
        Command.prototype.transCallbackData = function (cmd, data) {
            if (!cmd || !data) {
                return;
            }
            switch (cmd) {
                case "getBluetoothDevices":
                    this.transParamToArrayBuffer("advertisData", data.devices);
                    break;
            }
        };
        Command.prototype.transParams = function (cmd, params) {
            if (!cmd) {
                return params;
            }
            var paramsToTrans = params;
            switch (cmd) {
                case "writeBLECharacteristicValue":
                    this.tranParamToNumberArray("value", paramsToTrans);
                    break;
                case "onBluetoothDeviceFound":
                    this.transParamToArrayBuffer("advertisData", paramsToTrans.devices);
                    break;
                case "onBLECharacteristicValueChange":
                    this.transParamToArrayBuffer("value", paramsToTrans);
            }
            return paramsToTrans;
        };
        Command.prototype.tranParamToNumberArray = function (key, params) {
            if (!params || !params[key]) {
                return;
            }
            var arr = Array.prototype.slice.call(params[key]);
            params[key] = arr;
        };
        Command.prototype.transParamToArrayBuffer = function (key, params) {
            if (!params || params === null) {
                return;
            }
            if (params instanceof Array) {
                params.forEach(function (item) {
                    if (item[key] && item[key] instanceof Array) {
                        var bufferView = new Uint8Array(item[key]);
                        item[key] = bufferView;
                    }
                });
                return;
            }
            if (params[key] && params[key] instanceof Array) {
                var bufferView = new Uint8Array(params[key]);
                params[key] = bufferView;
            }
        };
        Command.prototype.check = function (callbackId, cmd, params) {
            return checkRule(cmd, params, (function (me, callbackId) { return function (key, values) {
                me.triggerFail(callbackId, key, values);
            }; })(this, callbackId));
        };
        Command.prototype.internalExecWithCallbackId = function (callbackId, cmd, params) {
            if (this.check(callbackId, cmd, params)) {
                params = this.transParams(cmd, params);
                var win = window;
                var message = {
                    callbackId: callbackId,
                    command: cmd,
                    params: params,
                };
                if (win.webkit && win.webkit.messageHandlers &&
                    win.webkit.messageHandlers.command &&
                    win.webkit.messageHandlers.command.postMessage) {
                    // iOS
                    win.webkit.messageHandlers.command.postMessage(message);
                }
                else if (win.command && win.command.postMessage) {
                    // Android
                    win.command.postMessage(JSON.stringify(message));
                }
                else {
                    // Others
                    win.console.log(message);
                    this.triggerFail(message.callbackId, "ERR_COMMAND_EXEC", null);
                }
            }
        };
        Command.prototype.internalExec = function (cmd, options, task) {
            var id = "callback_" + this.callbackIdSequence++;
            if (task) {
                task.setCallbackId(id);
            }
            this.callbackMap[id] = {
                fail: options && options.fail,
                success: options && options.success,
                task: task,
                cmd: cmd
            };
            delete options.fail;
            delete options.success;
            this.internalExecWithCallbackId(id, cmd, options);
        };
        Command.prototype.exec = function (cmd, options) {
            this.internalExec(cmd, options, null);
            return this;
        };
        Command.prototype.execTask = function (cmd, options, task) {
            this.internalExec(cmd, options, task);
        };
        Command.locale = locale;
        Command.sVersion = "1.2.1";
        return Command;
    }());

    // 多语言 - 中文
    // ----------
    // 设置当前语言
    Command.locale.localeName = "zh-cn";
    Command.locale.defineLocale(Command.locale.localeName, {
        ERR_LOCAL_BY_KEY: { errCode: 4000, errMsg: "{0} 不是合法的多语言关键字" },
        ERR_COMMAND_EXEC: { errCode: 4001, errMsg: "当前浏览器不支持插件调用" },
        ERR_COMMAND_EXEC_PARAM: { errCode: 4002, errMsg: "{0} 参数值不合法" },
        ERR_COMMAND_EXEC_CALLBACK: { errCode: 4003, errMsg: "回调方法找不到：{0}" },
        ERR_SYSTEM_ERROR: { errCode: 4004, errMsg: "系统错误：{0}" },
        ERR_COMMAND_INVOKE: { errCode: 4005, errMsg: "api执行错误：{0}" },
        ERR_COMMAND_CANCEL: { errCode: 4006, errMsg: "取消调用" },
        ERR_COMMAND_EXEC_NOT_FOUND: { errCode: 4007, errMsg: "api未找到" },
        ERR_MSG_REQUEST: { errCode: 4011, errMsg: "请求失败：{0}" },
        ERR_MSG_REQUEST_METHOD: { errCode: 4012, errMsg: "错误的method参数：{0}" },
        ERR_MSG_GETIMAGE: { errCode: 4013, errMsg: "获取图片失败：{0}" },
        ERR_MSG_SAVE_ALBUM: { errCode: 4014, errMsg: "保存相册失败：{0}" },
        ERR_MSG_HTTP_CONCURRENCY: { errCode: 4015, errMsg: "超出网络请求最大并发数：{0}" },
        ERR_MSG_NETWORK_ERROR: { errCode: 4016, errMsg: "网络错误: {0}" },
        ERR_MSG_UPLOAD: { errCode: 4021, errMsg: "文件上传失败：{0}" },
        ERR_MSG_UPLOAD_SIGNATURE: { errCode: 4022, errMsg: "获取文件上传签名失败：{0}" },
        ERR_MSG_DOWNLOAD: { errCode: 4023, errMsg: "文件下载失败：{0}" },
        ERR_MSG_DOWNLOAD_ACCESSES: { errCode: 4024, errMsg: "获取文件下载地址失败：{0}" },
        ERR_MSG_FILEPATH_NOFOUND: { errCode: 4030, errMsg: "本地文件不存在：{0}" },
        ERR_MSG_FILEPATH_NOTEMPORSAVED: { errCode: 4031, errMsg: "必须是临时文件或存储文件：{0}" },
        ERR_MSG_FILEPATH_NOFILEPATH: { errCode: 4032, errMsg: "必须是本地路径：{0}" },
        ERR_MSG_SAVEFILE_NOTEMP: { errCode: 4033, errMsg: "必须是临时文件：{0}" },
        ERR_MSG_SAVEFILE_MOVE: { errCode: 4034, errMsg: "移动文件出错：{0}" },
        ERR_MSG_REMOVESAVEFILE_REMOVE: { errCode: 4035, errMsg: "删除文件出错：{0}" },
        ERR_MSG_REMOVESAVEFILE_NOSAVEDFILE: { errCode: 4036, errMsg: "必须是已保存文件：{0}" },
        ERR_MSG_RES_NOTFOUND: { errCode: 4037, errMsg: "资源未找到：{0}" },
        ERR_MSG_UNBUNDLEFILE_OPEN: { errCode: 4040, errMsg: "打开压缩文件出错：{0}" },
        ERR_MSG_UNBUNDLEFILE_UNZIP: { errCode: 4041, errMsg: "解压缩文件出错：{0}" },
        ERR_MSG_REMOVEBUNDLE_REMOVE: { errCode: 4042, errMsg: "移除解压目录失败：{0}" },
        ERR_MSG_REMOVEBUNDLE_NOBUNDLE: { errCode: 4043, errMsg: "必须是解压目录路径：{0}" },
        ERR_MSG_OPENDOCUMENT_LINK: { errCode: 4044, errMsg: "打开文档时创建连接文件失败：{0}" },
        ERR_MSG_OPENDOCUMENT_FILEEXTEISON: { errCode: 4045, errMsg: "打开文件时指定的文件扩展名必须为：{0}" },
        ERR_MSG_SETSTORAGE: { errCode: 4050, errMsg: "存储数据失败：{0}" },
        ERR_MSG_REMOVESTORAGE: { errCode: 4051, errMsg: "删除数据失败：{0}" },
        ERR_MSG_CLEARSTORAGE: { errCode: 4052, errMsg: "清空数据失败" },
        ERR_MSG_ADDUPLOADTASK: { errCode: 4060, errMsg: "添加上传任务失败" },
        ERR_MSG_ADDUPLOADTASK_COPY: { errCode: 4061, errMsg: "添加上传任务时，拷贝文件失败：{0}" },
        ERR_MSG_ADDUPLOADTASK_MOVE: { errCode: 4062, errMsg: "添加上传任务时，移动目录失败：{0}" },
        ERR_MSG_ADDUPLOADTASK_UPDATE: { errCode: 4063, errMsg: "添加上传任务时，更新附件路径失败" },
        ERR_MSG_STOPUPLOADTASK_NOTFOUND: { errCode: 4064, errMsg: "停止上传任务失败,未找到任务" },
        ERR_MSG_REMOVEUPLOADTASK: { errCode: 4065, errMsg: "删除上传任务失败：{0}" },
        ERR_MSG_CLEARUPLOADTASK: { errCode: 4066, errMsg: "清空上传任务失败" },
        ERR_MSG_BLE_NOT_INIT: { errCode: 4100, errMsg: "未初始化蓝牙适配器" },
        ERR_MSG_BLE_NOT_AVAILABLE: { errCode: 4101, errMsg: "当前蓝牙适配器不可用" },
        ERR_MSG_BLE_NO_DEVICE: { errCode: 4102, errMsg: "没有找到指定设备" },
        ERR_MSG_BLE_CONNECTION_FAIL: { errCode: 4103, errMsg: "连接失败：{0}" },
        ERR_MSG_BLE_NO_SERVICE: { errCode: 4104, errMsg: "没有找到指定服务" },
        ERR_MSG_BLE_NO_CHARACTERISTIC: { errCode: 4105, errMsg: "没有找到指定特征值" },
        ERR_MSG_BLE_NO_CONNECTION: { errCode: 4106, errMsg: "当前连接已断开" },
        ERR_MSG_BLE_PROPERTY_NOT_SUPPORT: { errCode: 4107, errMsg: "当前特征值不支持此操作" },
        ERR_MSG_BLE_SYSTEM_ERROR: { errCode: 4108, errMsg: "系统错误：{0}" },
        ERR_MSG_BLE_SYSTEM_NOT_SUPPORT: { errCode: 4109, errMsg: "系统版本低于 4.3 不支持 BLE" },
        ERR_MSG_BLE_OPERATE_TIME_OUT: { errCode: 4110, errMsg: "连接超时" },
        ERR_MSG_BLE_INVALID_DATA: { errCode: 4111, errMsg: "连接 deviceId 为空或者是格式不正确" },
    });

    if (!window.iwop || !window.iwop.isOld || window.iwop.isOld(Command.sVersion)) {
        window.iwop = new Command(window.iwop);
        initHistoryNotifier();
    }
    function initHistoryNotifier() {
        var delayNotifyTimer = null;
        function delayNotify() {
            if (delayNotifyTimer) {
                clearTimeout(delayNotifyTimer);
            }
            delayNotifyTimer = setTimeout(function () {
                window.iwop.hashChange({ "hash": "change" });
                delayNotifyTimer = null;
            }, 100);
        }
        window.addEventListener("hashchange", delayNotify);
        var history = window.history;
        var rawPushState = history.pushState;
        var rawReplaceState = history.replaceState;
        history.pushState = function () {
            delayNotify();
            rawPushState.apply(this, arguments);
        };
        history.replaceState = function () {
            delayNotify();
            rawReplaceState.apply(this, arguments);
        };
    }

    return Command;

}());
iwop.onHistoryBack({
    success: function(res) {
        console.log('success:',res);
    },
    fail: function(res) {
        console.log('fail:',err);
    }
});


iwop.hashChange({
    success: function(res) {
        console.log('hashChange:',res);
    },
    fail: function(err) {
        console.log('hashChange:',err);
    }
});

window.addEventListener('popstate',(...args)=>{
    console.log('popstate:',args);
})
window.addEventListener('popstate',(evt)=>{
    console.log('popstate:', evt.state);
})
