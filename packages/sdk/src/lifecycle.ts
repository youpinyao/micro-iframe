import type { AppProps, Message, LifecycleMessage } from '@micro-iframe/types'
import { MessageType } from '@micro-iframe/types'

/**
 * 生命周期钩子函数类型
 */
export type LifecycleHook = (props: AppProps) => void | Promise<void>

/**
 * 生命周期管理器
 */
export class LifecycleManager {
  private mountHook?: LifecycleHook
  private unmountHook?: LifecycleHook
  private updateHook?: LifecycleHook
  private currentProps?: AppProps

  constructor(private communication: { on: (type: string, handler: unknown) => () => void }) {
    this.init()
  }

  /**
   * 初始化生命周期监听
   */
  private init(): void {
    // 监听挂载消息
    this.communication.on(MessageType.MOUNT, (message: Message) => {
      if (message.type === MessageType.MOUNT) {
        const lifecycleMessage = message as LifecycleMessage
        if (lifecycleMessage.props) {
          const props: AppProps = {
            name: '',
            container: document.body,
            route: lifecycleMessage.props.route || '',
            meta: lifecycleMessage.props.meta,
          }
          this.handleMount(props)
        }
      }
    })

    // 监听卸载消息
    this.communication.on(MessageType.UNMOUNT, () => {
      this.handleUnmount()
    })

    // 监听更新消息
    this.communication.on(MessageType.UPDATE, (message: Message) => {
      if (message.type === MessageType.UPDATE) {
        const lifecycleMessage = message as LifecycleMessage
        if (lifecycleMessage.props) {
          const props: AppProps = {
            name: '',
            container: document.body,
            route: lifecycleMessage.props.route || '',
            meta: lifecycleMessage.props.meta,
          }
          this.handleUpdate(props)
        }
      }
    })
  }

  /**
   * 设置挂载钩子
   */
  public onMount(hook: LifecycleHook): void {
    this.mountHook = hook
  }

  /**
   * 设置卸载钩子
   */
  public onUnmount(hook: LifecycleHook): void {
    this.unmountHook = hook
  }

  /**
   * 设置更新钩子
   */
  public onUpdate(hook: LifecycleHook): void {
    this.updateHook = hook
  }

  /**
   * 处理挂载
   */
  private async handleMount(props: AppProps): Promise<void> {
    this.currentProps = props

    if (this.mountHook) {
      await this.mountHook(props)
    }
  }

  /**
   * 处理卸载
   */
  private async handleUnmount(): Promise<void> {
    if (this.currentProps && this.unmountHook) {
      await this.unmountHook(this.currentProps)
    }

    this.currentProps = undefined
  }

  /**
   * 处理更新
   */
  private async handleUpdate(props: AppProps): Promise<void> {
    this.currentProps = props

    if (this.updateHook) {
      await this.updateHook(props)
    }
  }

  /**
   * 获取当前属性
   */
  public getCurrentProps(): AppProps | undefined {
    return this.currentProps
  }
}

