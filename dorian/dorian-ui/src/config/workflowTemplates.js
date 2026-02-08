/**
 * Predefined workflow templates with actual Blockly workspace configurations
 */

export const workflowTemplates = {
  'customer-support': {
    id: 'customer-support',
    name: 'Customer Support',
    description: 'AI-powered customer service automation',
    gradient: 'linear-gradient(135deg, #85C1FF 0%, #5BA3FF 100%)',
    agentType: 'support',
    blocks: {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'agent_start',
            id: 'start_block',
            x: 50,
            y: 30,
            fields: {
              AGENT_TYPE: 'support'
            },
            inputs: {
              STEPS: {
                block: {
                  type: 'gmail_fetch_unread',
                  id: 'fetch_emails',
                  next: {
                    block: {
                      type: 'gmail_for_each_email',
                      id: 'loop_emails',
                      inputs: {
                        DO: {
                          block: {
                            type: 'ai_analyze',
                            id: 'analyze_sentiment',
                            next: {
                              block: {
                                type: 'if_contains',
                                id: 'check_urgent',
                                fields: {
                                  KEYWORD: 'urgent'
                                },
                                inputs: {
                                  TEXT: {
                                    block: {
                                      type: 'gmail_get_property',
                                      id: 'get_subject',
                                      fields: {
                                        PROPERTY: 'subject'
                                      }
                                    }
                                  },
                                  DO: {
                                    block: {
                                      type: 'ai_generate',
                                      id: 'generate_response',
                                      next: {
                                        block: {
                                          type: 'gmail_send_reply',
                                          id: 'send_reply'
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        ]
      }
    }
  },

  'data-processor': {
    id: 'data-processor',
    name: 'Data Processing',
    description: 'Transform and analyze data automatically',
    gradient: 'linear-gradient(135deg, #A3E6A3 0%, #79D479 100%)',
    agentType: 'data',
    blocks: {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'agent_start',
            id: 'start_block',
            x: 50,
            y: 30,
            fields: {
              AGENT_TYPE: 'data'
            },
            inputs: {
              STEPS: {
                block: {
                  type: 'input_data',
                  id: 'get_data',
                  fields: {
                    FIELD_NAME: 'rawData'
                  },
                  next: {
                    block: {
                      type: 'ai_extract',
                      id: 'extract_info',
                      next: {
                        block: {
                          type: 'set_variable',
                          id: 'store_result',
                          fields: {
                            VAR_NAME: 'processedData'
                          },
                          next: {
                            block: {
                              type: 'display_result',
                              id: 'show_output'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        ]
      }
    }
  },

  'email-intelligence': {
    id: 'email-intelligence',
    name: 'Email Intelligence',
    description: 'Smart email categorization and auto-responses',
    gradient: 'linear-gradient(135deg, #FFD666 0%, #FFC933 100%)',
    agentType: 'email',
    blocks: {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'agent_start',
            id: 'start_block',
            x: 50,
            y: 30,
            fields: {
              AGENT_TYPE: 'email'
            },
            inputs: {
              STEPS: {
                block: {
                  type: 'gmail_search',
                  id: 'search_emails',
                  fields: {
                    QUERY: 'is:unread'
                  },
                  next: {
                    block: {
                      type: 'gmail_for_each_email',
                      id: 'process_each',
                      inputs: {
                        DO: {
                          block: {
                            type: 'ai_analyze',
                            id: 'categorize',
                            next: {
                              block: {
                                type: 'ai_generate',
                                id: 'create_response',
                                next: {
                                  block: {
                                    type: 'gmail_send_reply',
                                    id: 'auto_reply',
                                    next: {
                                      block: {
                                        type: 'gmail_mark_read',
                                        id: 'mark_as_read'
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        ]
      }
    }
  },

  'content-generator': {
    id: 'content-generator',
    name: 'Content Creation',
    description: 'Generate reports and summaries at scale',
    gradient: 'linear-gradient(135deg, #B399FF 0%, #9966FF 100%)',
    agentType: 'data',
    blocks: {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'agent_start',
            id: 'start_block',
            x: 50,
            y: 30,
            fields: {
              AGENT_TYPE: 'data'
            },
            inputs: {
              STEPS: {
                block: {
                  type: 'input_data',
                  id: 'get_topic',
                  fields: {
                    FIELD_NAME: 'topic'
                  },
                  next: {
                    block: {
                      type: 'ai_generate',
                      id: 'generate_content',
                      next: {
                        block: {
                          type: 'set_variable',
                          id: 'save_content',
                          fields: {
                            VAR_NAME: 'generatedContent'
                          },
                          next: {
                            block: {
                              type: 'display_result',
                              id: 'show_content'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        ]
      }
    }
  },

  'workflow-automation': {
    id: 'workflow-automation',
    name: 'Process Automation',
    description: 'Connect tools and eliminate manual work',
    gradient: 'linear-gradient(135deg, #FFB366 0%, #FF9933 100%)',
    agentType: 'support',
    blocks: {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'agent_start',
            id: 'start_block',
            x: 50,
            y: 30,
            fields: {
              AGENT_TYPE: 'support'
            },
            inputs: {
              STEPS: {
                block: {
                  type: 'gmail_fetch_unread',
                  id: 'check_inbox',
                  next: {
                    block: {
                      type: 'gmail_for_each_email',
                      id: 'process_emails',
                      inputs: {
                        DO: {
                          block: {
                            type: 'ai_extract',
                            id: 'extract_data',
                            next: {
                              block: {
                                type: 'set_variable',
                                id: 'store_data',
                                fields: {
                                  VAR_NAME: 'extractedData'
                                },
                                next: {
                                  block: {
                                    type: 'log_message',
                                    id: 'log_action',
                                    fields: {
                                      MESSAGE: 'Processed email'
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        ]
      }
    }
  },

  'lead-qualifier': {
    id: 'lead-qualifier',
    name: 'Lead Qualification',
    description: 'Streamline your sales pipeline',
    gradient: 'linear-gradient(135deg, #FF9999 0%, #FF6666 100%)',
    agentType: 'sales',
    blocks: {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'agent_start',
            id: 'start_block',
            x: 50,
            y: 30,
            fields: {
              AGENT_TYPE: 'sales'
            },
            inputs: {
              STEPS: {
                block: {
                  type: 'gmail_search',
                  id: 'find_leads',
                  fields: {
                    QUERY: 'subject:inquiry OR subject:demo'
                  },
                  next: {
                    block: {
                      type: 'gmail_for_each_email',
                      id: 'qualify_each',
                      inputs: {
                        DO: {
                          block: {
                            type: 'ai_analyze',
                            id: 'score_lead',
                            next: {
                              block: {
                                type: 'if_contains',
                                id: 'check_qualified',
                                fields: {
                                  KEYWORD: 'qualified'
                                },
                                inputs: {
                                  TEXT: {
                                    block: {
                                      type: 'get_variable',
                                      id: 'get_score',
                                      fields: {
                                        VAR_NAME: 'leadScore'
                                      }
                                    }
                                  },
                                  DO: {
                                    block: {
                                      type: 'gmail_send_reply',
                                      id: 'send_follow_up'
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        ]
      }
    }
  }
};
