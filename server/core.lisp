(ql:quickload '(:hunchentoot :cl-who :cl-json :easy-routes))

(defpackage :core
  (:use :cl :cl-who :hunchentoot :cl-json :easy-routes :jsown))

(in-package :core)

(defconstant +chunk-size+ 16)
(defconstant +world-side-length+ (expt 2 30))
(defconstant +mine-probability+ (/ 2 10))
(defconstant +user-actions+ '(new-connection request reveal decorate))
(defconstant +directions+ '(north northwest west southwest south southeast east northeast))

(defun uniform ()
  "Get a random number in [0, 1)"
  (let ((m (expt 2 31)))
    (/ (random m) m)))

(defclass chunk ()
  ((id :reader chunk-id
       :initarg :id)
   (mines :reader chunk-mines
	  :initform
	  (make-array +chunk-size+
		      :initial-contents (loop repeat +chunk-size+
					   collect (< (uniform) +mine-probability+))))
   (actions :accessor chunk-actions
	    :initform '())))

(defvar *chunks* '())
(defvar *users* '())

(defun get-chunk (n)
  "Returns chunk with id N.  If that chunk doesn't exist it is generated."
  (let ((res (find-if (lambda (c) (eq n (chunk-id c))) *chunks*)))
    (if res
	res
	(progn
	  (push (make-instance 'chunk :id n) *chunks*)
	  (car *chunks*)))))

(defun north (n &optional (s +world-side-length+))
  (- n s))

(defun east (n)
  (- n 1))

(defun south (n &optional (s +world-side-length+))
  (+ n s))

(defun west (n)
  (+ n 1))

(defun flatten (x &optional stack out)
  (cond ((consp x) (flatten (cdr x) (cons (car x) stack) out))
	(x         (flatten (car stack) (cdr stack) (cons x out)))
	(stack     (flatten (car stack) (cdr stack) out))
	(t out)))

(defun iota (start stop step)
  (if (>= start stop)
      nil
      (cons start (iota (+ start step) stop step))))

(defun +- (x a)
  (cons (- x a) (+ x a)))

(defparameter *acceptor* (make-instance 'easy-routes-acceptor :port 3000))

;; need object containing list of addChunk actions.
;; each action has a chunk with id, neighbors, and tiles.
(defun handle-new-connection ()
  (setf (hunchentoot:content-type*) "text/json")
  )

;; TODO: Bias rng to favor middle of map
(defun new-connection (radius &optional (center (random (expt +world-side-length+ 2))))
  "Return a square of chunks with specified RADIUS."
  (let* ((cids (new-connection-chunks radius center))
	 (cids-neighbors (mapcar #'chunk-neighbors cids))
	 (chunks (mapcar #'get-chunk cids)))
    (mapcar (lambda (cid neighbors chunks)
	      (list (cons 'id cid)
		    (cons 'neighbors neighbors)
		    (cons 'tiles (chunk-mines chunks))))
	    cids cids-neighbors chunks)))

(defun new-connection-chunks (radius center)
  "Return a list of cids such that its a square with center CENTER
and sidelength 2 * RADIUS + 1"
  (let* ((s +world-side-length+)
	 (middle-upper (- center (* radius s))))
    (let ((upper-row (iota (- middle-upper radius)
			   (+ middle-upper radius 1)
			   1)))
      (apply #'append (mapcar (lambda (i)
				(iota i (+ i (* s (length upper-row))) s))
			      upper-row)))))

(defun reveal (cid tid uid)
  "Reveal chunk CID, tile TID, giving ownership to user UID.")

(defun tile-neighbors (cid tid)
  "Return the 8 adjacent tiles to (CID TID)."
  (let ((s (sqrt +chunk-size+)))
    ))

(defun tile-cornerp (tid &optional (s (floor (sqrt +chunk-size+))))
  "Returns DIRECTION when TID is on a corner, otherwise NIL."
  (let ((corners (list (cons 0 'northwest) (cons (- s 1) 'northeast)
		       (cons (- (* s s) s) 'southwest) (cons (- (* s s) 1) 'southeast))))
    (cdr (assoc tid corners))))

(defun tile-boundaryp (tid &optional (s (floor (sqrt +chunk-size+))))
  "Returns DIRECTION when TID is on a chunk boundary, otherwise NIL.

Note: TILE-SIDEP considers corners to be sides."
  (cond ((< tid s) 'north)
	((zerop (mod tid s)) 'west)
	((zerop (mod (1+ tid) s)) 'east)
	((> tid (- (* s s) s 1)) 'south)
	(t nil)))

(defun tile-innerp (tid &optional (s (floor (sqrt +chunk-size+))))
  "Return 'inner when TID is not on a chunk boundary."
  (when (funcall (complement #'tile-boundaryp) tid s)
    'inner))

(defun chunk-neighbors (cid)
  "Return a list of neighboring chunk cids to CID beginning with north
and going counter-clockwise."
  (list (north cid) (west (north cid))
	(west cid)  (west (south cid))
	(south cid) (east (south cid))
	(east cid)  (east (north cid))))

(defroute test ("/test" :method :get) ()
  (setf (content-type*) "text/json")
  'hello)

(push (create-prefix-dispatcher "/api/new_connection" #'handle-new-connection) *dispatch-table*)
(pop *dispatch-table*)
