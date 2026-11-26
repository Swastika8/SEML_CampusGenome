import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { relativeTime } from '../lib/content';
import Modal from '../components/common/Modal';
import { ForumAside } from '../components/forum/ForumAside';
import { reportReasons, useForum, useForumRequest } from '../components/forum/forumData';
import { ForumNotice } from './ForumPage';

export default function ForumModeration() {
  const { user, token, loading } = useAuth();
  const { requireSignIn } = useForum();
  const notify = useToast();
  const [revision, setRevision] = useState(0);
  const [pending, setPending] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const reports = useForumRequest(user ? '/forum/reports' : null, token, revision);
  async function review(id, action) {
    setPending(id);
    try {
      await api('/forum/reports/' + id, { method: 'POST', token, body: { action } });
      setRevision((current) => current + 1);
      setConfirm(null);
      notify(action === 'remove' ? 'Post removed.' : 'Reports dismissed.');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setPending(null);
    }
  }
  return (
    <div className="forum-columns">
      <div className="forum-stream">
        <div className="forum-simple-heading">
          <ShieldCheck size={25} />
          <h1>Report queue</h1>
          <p>Review reports for the communities you moderate.</p>
        </div>
        {loading || reports.loading ? (
          <p className="forum-single-loading" role="status">
            Loading reports…
          </p>
        ) : !user ? (
          <ForumNotice title="Sign in to review reports">
            <button className="forum-button forum-primary" onClick={requireSignIn}>
              Sign in
            </button>
          </ForumNotice>
        ) : reports.error ? (
          <ForumNotice title="Queue unavailable">
            <p role="alert">{reports.error}</p>
            <button className="forum-button" onClick={() => setRevision((current) => current + 1)}>
              Try again
            </button>
          </ForumNotice>
        ) : reports.result?.data.length ? (
          <ol className="forum-report-list">
            {reports.result.data.map((report) => (
              <li key={report.id}>
                <p>
                  g/{report.community_slug} · {relativeTime(report.reported_at)}
                </p>
                <h2>
                  <Link to={'/nodes/' + report.id}>{report.title}</Link>
                </h2>
                <p>
                  {report.report_count} {report.report_count === 1 ? 'report' : 'reports'} ·{' '}
                  {report.reasons.map((reason) => reportReasons[reason]).join(', ')}
                </p>
                <div>
                  <button
                    className="forum-button"
                    disabled={pending !== null}
                    onClick={() => review(report.id, 'dismiss')}
                  >
                    Dismiss reports
                  </button>
                  <button
                    className="forum-button forum-danger"
                    disabled={pending !== null}
                    onClick={() => setConfirm(report)}
                  >
                    <Trash2 size={16} /> Remove post
                  </button>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <ForumNotice title="You’re all caught up">
            <p>There are no pending reports in your communities.</p>
          </ForumNotice>
        )}
        {confirm && (
          <Modal
            className="forum-dialog"
            title="Remove reported post?"
            onClose={() => {
              if (pending === null) setConfirm(null);
            }}
          >
            <p className="forum-report-title">{confirm.title}</p>
            <p>The post and its discussion will disappear from public view.</p>
            <div className="dialog-actions">
              <button
                className="forum-button"
                disabled={pending !== null}
                onClick={() => setConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="forum-button forum-danger"
                disabled={pending !== null}
                onClick={() => review(confirm.id, 'remove')}
              >
                {pending ? 'Removing…' : 'Confirm removal'}
              </button>
            </div>
          </Modal>
        )}
      </div>
      <ForumAside />
    </div>
  );
}
