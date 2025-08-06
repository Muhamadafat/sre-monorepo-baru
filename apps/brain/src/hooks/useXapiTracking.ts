import { useCallback } from 'react';
import { sendXapiStatement } from '@sre-monorepo/lib';
import { createClient } from '@sre-monorepo/lib';
import { useParams, usePathname } from 'next/navigation';
import type { ExtendedNode, ExtendedEdge } from "../types"

interface XapiTrackingHook {
  trackNodeClick: (node: ExtendedNode) => void;
  trackEdgeClick: (edge: ExtendedEdge) => void;
  trackPdfUpload: (fileName: string, uploadType: 'direct' | 'form') => void;
  trackPdfView: (pdfName: string, action: 'open' | 'close') => void;
  trackChatInteraction: (message: string, type: 'question' | 'response') => void;
  trackModalInteraction: (modalType: string, action: 'open' | 'close') => void;
  trackTabChange: (fromTab: string, toTab: string) => void;
  trackViewModeChange: (fromMode: string, toMode: string) => void;
  trackGraphModeChange: (fromGraph: string, toGraph: string) => void;
}

export const useXapiTracking = (session: any): XapiTrackingHook => {
  const params = useParams();
  const pathname = usePathname();
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  
  // 🔍 DEBUG: Log hook initialization
  console.log("🔍 useXapiTracking initialized:", {
    session: !!session,
    projectId,
    pathname,
    sessionUser: session?.user?.id
  });

  const getSessionId = useCallback(() => {
    if (!session) {
      console.warn("❌ getSessionId: No session available");
      return null;
    }
    const sessionId = `${session.user.id}_${Math.floor(session.expires_at! / 1000)}`;
    console.log("✅ getSessionId:", sessionId);
    return sessionId;
  }, [session]);

  const getBaseContext = useCallback(() => {
    const context = {
      extensions: {
        sessionId: getSessionId(),
        projectId: projectId,
        currentPath: pathname,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : ''
      }
    };
    console.log("🔍 getBaseContext:", context);
    return context;
  }, [getSessionId, projectId, pathname]);

  // ✅ 1. Node Click Tracking dengan Enhanced Debug
  const trackNodeClick = useCallback((node: ExtendedNode) => {
    console.log("🎯 trackNodeClick called:", {
      nodeId: node.id,
      nodeLabel: node.label,
      hasSession: !!session,
      sessionUserId: session?.user?.id
    });

    if (!session) {
      console.error("❌ trackNodeClick: No session - aborting");
      return;
    }

    const statement = {
      verb: {
        id: "http://adlnet.gov/expapi/verbs/interacted",
        display: { "en-US": "clicked node" }
      },
      object: {
        id: `brain/node/${node.id}`,
        definition: {
          name: { "en-US": `Node: ${node.label || node.id}` },
          description: { "en-US": node.title || "Graph node interaction" },
          type: "http://adlnet.gov/expapi/activities/interaction"
        }
      },
      result: {
        completion: true,
        success: true
      },
      context: {
        ...getBaseContext(),
        extensions: {
          ...getBaseContext().extensions,
          interactionType: "node-click",
          nodeData: {
            id: node.id,
            label: node.label,
            group: node.group,
            size: node.size
          }
        }
      }
    };

    console.log("📤 Sending xAPI statement for node click:", statement);
    
    try {
      const result = sendXapiStatement(statement, session, pathname, "brain");
      console.log("✅ sendXapiStatement result:", result);
    } catch (error) {
      console.error("❌ sendXapiStatement error:", error);
    }
  }, [session, getBaseContext, pathname]);

  // ✅ 2. Edge Click Tracking dengan Enhanced Debug
  const trackEdgeClick = useCallback((edge: ExtendedEdge) => {
    console.log("🎯 trackEdgeClick called:", {
      edgeId: edge.id,
      edgeLabel: edge.label,
      hasSession: !!session,
      sessionUserId: session?.user?.id
    });

    if (!session) {
      console.error("❌ trackEdgeClick: No session - aborting");
      return;
    }

    const statement = {
      verb: {
        id: "http://adlnet.gov/expapi/verbs/interacted",
        display: { "en-US": "clicked edge" }
      },
      object: {
        id: `brain/edge/${edge.id}`,
        definition: {
          name: { "en-US": `Edge: ${edge.label || edge.id}` },
          description: { "en-US": String(edge.title ?? "Graph edge interaction") },
          type: "http://adlnet.gov/expapi/activities/interaction"
        }
      },
      result: {
        completion: true,
        success: true
      },
      context: {
        ...getBaseContext(),
        extensions: {
          ...getBaseContext().extensions,
          interactionType: "edge-click",
          edgeData: {
            id: edge.id,
            from: edge.from,
            to: edge.to,
            label: edge.label
          }
        }
      }
    };

    console.log("📤 Sending xAPI statement for edge click:", statement);
    
    try {
      const result = sendXapiStatement(statement, session, pathname, "brain");
      console.log("✅ sendXapiStatement result:", result);
    } catch (error) {
      console.error("❌ sendXapiStatement error:", error);
    }
  }, [session, getBaseContext, pathname]);

  // ✅ 3. PDF Upload Tracking
  const trackPdfUpload = useCallback((fileName: string, uploadType: 'direct' | 'form') => {
    console.log("🎯 trackPdfUpload called:", { fileName, uploadType, hasSession: !!session });
    
    if (!session) {
      console.error("❌ trackPdfUpload: No session - aborting");
      return;
    }

    const statement = {
      verb: {
        id: "http://adlnet.gov/expapi/verbs/imported",
        display: { "en-US": "uploaded PDF" }
      },
      object: {
        id: `brain/upload/${fileName}`,
        definition: {
          name: { "en-US": `PDF Upload: ${fileName}` },
          description: { "en-US": `User uploaded PDF file via ${uploadType} method` },
          type: "http://adlnet.gov/expapi/activities/media"
        }
      },
      result: {
        completion: true,
        success: true
      },
      context: {
        ...getBaseContext(),
        extensions: {
          ...getBaseContext().extensions,
          interactionType: "pdf-upload",
          uploadMethod: uploadType,
          fileName: fileName,
          fileType: "PDF"
        }
      }
    };

    console.log("📤 Sending xAPI statement for PDF upload:", statement);
    
    try {
      const result = sendXapiStatement(statement, session, pathname, "brain");
      console.log("✅ sendXapiStatement result:", result);
    } catch (error) {
      console.error("❌ sendXapiStatement error:", error);
    }
  }, [session, getBaseContext, pathname]);

  // ✅ 4. PDF View Tracking
  const trackPdfView = useCallback((pdfName: string, action: 'open' | 'close') => {
    if (!session) return;

    sendXapiStatement({
      verb: {
        id: action === 'open' 
          ? "http://adlnet.gov/expapi/verbs/launched"
          : "http://adlnet.gov/expapi/verbs/suspended",
        display: { "en-US": `${action === 'open' ? 'opened' : 'closed'} PDF` }
      },
      object: {
        id: `brain/pdf-view/${pdfName}`,
        definition: {
          name: { "en-US": `PDF Viewer: ${pdfName}` },
          description: { "en-US": `User ${action === 'open' ? 'opened' : 'closed'} PDF in viewer` },
          type: "http://adlnet.gov/expapi/activities/media"
        }
      },
      result: {
        completion: action === 'close',
        success: true
      },
      context: {
        ...getBaseContext(),
        extensions: {
          ...getBaseContext().extensions,
          interactionType: "pdf-view",
          viewAction: action,
          documentName: pdfName
        }
      }
    }, session, pathname, "brain");
  }, [session, getBaseContext, pathname]);

  // ✅ 5. Chat Interaction Tracking
  const trackChatInteraction = useCallback((message: string, type: 'question' | 'response') => {
    if (!session) return;

    sendXapiStatement({
      verb: {
        id: type === 'question' 
          ? "http://adlnet.gov/expapi/verbs/asked"
          : "http://adlnet.gov/expapi/verbs/responded",
        display: { "en-US": type === 'question' ? "asked question" : "received response" }
      },
      object: {
        id: `brain/chat/${type}`,
        definition: {
          name: { "en-US": `Chat ${type === 'question' ? 'Question' : 'Response'}` },
          description: { "en-US": `AI chatbot ${type} in brainstorming session` },
          type: "http://adlnet.gov/expapi/activities/interaction"
        }
      },
      result: {
        completion: true,
        success: true,
        response: type === 'question' ? message.substring(0, 100) : message.substring(0, 100)
      },
      context: {
        ...getBaseContext(),
        extensions: {
          ...getBaseContext().extensions,
          interactionType: "chat-interaction",
          messageType: type,
          messageLength: message.length,
          messagePreview: message.substring(0, 50)
        }
      }
    }, session, pathname, "brain");
  }, [session, getBaseContext, pathname]);

  // ✅ 6. Modal Interaction Tracking
  const trackModalInteraction = useCallback((modalType: string, action: 'open' | 'close') => {
    if (!session) return;

    sendXapiStatement({
      verb: {
        id: action === 'open' 
          ? "http://adlnet.gov/expapi/verbs/launched"
          : "http://adlnet.gov/expapi/verbs/suspended",
        display: { "en-US": `${action === 'open' ? 'opened' : 'closed'} modal` }
      },
      object: {
        id: `brain/modal/${modalType}`,
        definition: {
          name: { "en-US": `${modalType} Modal` },
          description: { "en-US": `User ${action === 'open' ? 'opened' : 'closed'} ${modalType} modal` },
          type: "http://adlnet.gov/expapi/activities/interaction"
        }
      },
      result: {
        completion: action === 'close',
        success: true
      },
      context: {
        ...getBaseContext(),
        extensions: {
          ...getBaseContext().extensions,
          interactionType: "modal-interaction",
          modalType: modalType,
          modalAction: action
        }
      }
    }, session, pathname, "brain");
  }, [session, getBaseContext, pathname]);

  // ✅ 7. Tab Change Tracking
  const trackTabChange = useCallback((fromTab: string, toTab: string) => {
    if (!session) return;

    sendXapiStatement({
      verb: {
        id: "http://adlnet.gov/expapi/verbs/navigated",
        display: { "en-US": "changed tab" }
      },
      object: {
        id: `brain/tab/${toTab}`,
        definition: {
          name: { "en-US": `${toTab} Tab` },
          description: { "en-US": `User navigated from ${fromTab} to ${toTab} tab` },
          type: "http://adlnet.gov/expapi/activities/interaction"
        }
      },
      result: {
        completion: true,
        success: true
      },
      context: {
        ...getBaseContext(),
        extensions: {
          ...getBaseContext().extensions,
          interactionType: "tab-navigation",
          fromTab: fromTab,
          toTab: toTab,
          navigationDirection: fromTab < toTab ? 'forward' : 'backward'
        }
      }
    }, session, pathname, "brain");
  }, [session, getBaseContext, pathname]);

  // ✅ 8. View Mode Change Tracking
  const trackViewModeChange = useCallback((fromMode: string, toMode: string) => {
    if (!session) return;

    sendXapiStatement({
      verb: {
        id: "http://adlnet.gov/expapi/verbs/configured",
        display: { "en-US": "changed view mode" }
      },
      object: {
        id: `brain/view-mode/${toMode}`,
        definition: {
          name: { "en-US": `${toMode} View Mode` },
          description: { "en-US": `User switched from ${fromMode} to ${toMode} view mode` },
          type: "http://adlnet.gov/expapi/activities/interaction"
        }
      },
      result: {
        completion: true,
        success: true
      },
      context: {
        ...getBaseContext(),
        extensions: {
          ...getBaseContext().extensions,
          interactionType: "view-mode-change",
          fromMode: fromMode,
          toMode: toMode
        }
      }
    }, session, pathname, "brain");
  }, [session, getBaseContext, pathname]);

  // ✅ 9. Graph Mode Change Tracking
  const trackGraphModeChange = useCallback((fromGraph: string, toGraph: string) => {
    if (!session) return;

    sendXapiStatement({
      verb: {
        id: "http://adlnet.gov/expapi/verbs/configured",
        display: { "en-US": "changed graph mode" }
      },
      object: {
        id: `brain/graph-mode/${toGraph}`,
        definition: {
          name: { "en-US": `${toGraph} Graph Mode` },
          description: { "en-US": `User switched from ${fromGraph} to ${toGraph} graph visualization` },
          type: "http://adlnet.gov/expapi/activities/interaction"
        }
      },
      result: {
        completion: true,
        success: true
      },
      context: {
        ...getBaseContext(),
        extensions: {
          ...getBaseContext().extensions,
          interactionType: "graph-mode-change",
          fromGraph: fromGraph,
          toGraph: toGraph,
          visualizationEngine: toGraph
        }
      }
    }, session, pathname, "brain");
  }, [session, getBaseContext, pathname]);

  return {
    trackNodeClick,
    trackEdgeClick,
    trackPdfUpload,
    trackPdfView,
    trackChatInteraction,
    trackModalInteraction,
    trackTabChange,
    trackViewModeChange,
    trackGraphModeChange
  };
};