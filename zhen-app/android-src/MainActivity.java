package com.ole983.truesolar;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 禁用长按选择与缩放,提升原生感
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.setLongClickable(false);
            webView.setHapticFeedbackEnabled(false);
            webView.setOnLongClickListener(v -> true);
            webView.getSettings().setTextZoom(100);
            // 关闭过度滚动光晕
            webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
        }
    }
}
